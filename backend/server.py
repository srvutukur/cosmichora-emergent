"""COSMIC HORA — FastAPI backend
Vedic astrology report platform. Handles auth, orders, mocked payments, report
type CMS, blog, testimonials, FAQs, contact, appointments, analytics, PDF gen,
and settings (prompts / email templates / API keys / site content).
External astrology calculation is expected via env `EXTERNAL_CALCULATE_API` &
`EXTERNAL_REPORT_API`; when unset, a stubbed mock report is generated.
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import io
import uuid
import logging
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Any, Dict

import bcrypt
import jwt
import httpx
from bson import ObjectId
from fastapi import FastAPI, APIRouter, Request, Response, HTTPException, Depends, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak

# ────────────────────────────────────────────────────────────────────────────
# Setup
# ────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("cosmichora")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ.get("JWT_SECRET", "changeme")


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    return jwt.encode(
        {
            "sub": user_id,
            "email": email,
            "role": role,
            "exp": now_utc() + timedelta(hours=12),
            "type": "access",
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def create_refresh_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": now_utc() + timedelta(days=7), "type": "refresh"},
        JWT_SECRET,
        algorithm=JWT_ALGORITHM,
    )


def serialize_doc(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if doc is None:
        return None
    d = dict(doc)
    if "_id" in d:
        d["id"] = str(d.pop("_id"))
    d.pop("password_hash", None)
    for k, v in list(d.items()):
        if isinstance(v, datetime):
            d[k] = iso(v)
        elif isinstance(v, ObjectId):
            d[k] = str(v)
    return d


# ────────────────────────────────────────────────────────────────────────────
# Auth dependency
# ────────────────────────────────────────────────────────────────────────────
async def get_current_user(request: Request) -> Dict[str, Any]:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def set_auth_cookies(response: Response, access: str, refresh: str) -> None:
    response.set_cookie("access_token", access, httponly=True, samesite="lax",
                        secure=False, max_age=43200, path="/")
    response.set_cookie("refresh_token", refresh, httponly=True, samesite="lax",
                        secure=False, max_age=604800, path="/")


# ────────────────────────────────────────────────────────────────────────────
# Pydantic models
# ────────────────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str
    mobile: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class ReportTypeIn(BaseModel):
    slug: str
    title: str
    tagline: Optional[str] = ""
    description: str
    price: float = 0.0
    currency: str = "INR"
    duration_days: int = 1
    image_url: Optional[str] = ""
    icon: Optional[str] = "sparkles"
    highlights: List[str] = []
    active: bool = True
    prompt_template: Optional[str] = ""


class OrderIn(BaseModel):
    report_slug: str
    birth_details: Dict[str, Any]
    coupon_code: Optional[str] = None


class PayIn(BaseModel):
    payment_id: Optional[str] = None
    signature: Optional[str] = None


class CouponIn(BaseModel):
    code: str
    discount_percent: float
    active: bool = True
    max_uses: int = 0
    description: Optional[str] = ""


class BlogIn(BaseModel):
    slug: str
    title: str
    excerpt: str
    content: str
    author: str = "Cosmic Hora Team"
    cover_image: Optional[str] = ""
    tags: List[str] = []
    published: bool = True


class TestimonialIn(BaseModel):
    name: str
    role: Optional[str] = ""
    quote: str
    avatar: Optional[str] = ""
    rating: int = 5
    active: bool = True


class FAQIn(BaseModel):
    question: str
    answer: str
    category: Optional[str] = "General"
    order: int = 0
    active: bool = True


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: Optional[str] = ""
    message: str


class AppointmentIn(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = ""
    date: str
    time: str
    topic: Optional[str] = ""


class SettingsIn(BaseModel):
    key: str
    value: Any


# ────────────────────────────────────────────────────────────────────────────
# App
# ────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Cosmic Hora API", version="1.0.0")
api = APIRouter(prefix="/api")


@api.get("/")
async def root():
    return {"service": "cosmic-hora", "status": "ok", "time": iso(now_utc())}


# ── Auth ────────────────────────────────────────────────────────────────────
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "mobile": payload.mobile or "",
        "role": "user",
        "created_at": now_utc(),
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email, "user")
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc["_id"] = res.inserted_id
    return {"user": serialize_doc(doc), "access_token": access}


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    access = create_access_token(uid, email, user.get("role", "user"))
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    return {"user": serialize_doc(user), "access_token": access}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return serialize_doc(user)


# ── Report Types ────────────────────────────────────────────────────────────
@api.get("/report-types")
async def list_report_types(all_flag: bool = Query(False, alias="all")):
    query = {} if all_flag else {"active": True}
    items = await db.report_types.find(query).sort("created_at", 1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.get("/report-types/{slug}")
async def get_report_type(slug: str):
    r = await db.report_types.find_one({"slug": slug})
    if not r:
        raise HTTPException(404, "Report type not found")
    return serialize_doc(r)


@api.post("/admin/report-types")
async def create_report_type(payload: ReportTypeIn, admin=Depends(require_admin)):
    if await db.report_types.find_one({"slug": payload.slug}):
        raise HTTPException(400, "Slug already exists")
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    res = await db.report_types.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/admin/report-types/{rid}")
async def update_report_type(rid: str, payload: ReportTypeIn, admin=Depends(require_admin)):
    await db.report_types.update_one({"_id": ObjectId(rid)}, {"$set": payload.model_dump()})
    r = await db.report_types.find_one({"_id": ObjectId(rid)})
    return serialize_doc(r)


@api.delete("/admin/report-types/{rid}")
async def delete_report_type(rid: str, admin=Depends(require_admin)):
    await db.report_types.delete_one({"_id": ObjectId(rid)})
    return {"ok": True}


# ── Orders ──────────────────────────────────────────────────────────────────
def compute_amount(base: float, coupon: Optional[Dict[str, Any]]) -> float:
    if coupon and coupon.get("active") and coupon.get("discount_percent", 0) > 0:
        return round(base * (1 - coupon["discount_percent"] / 100.0), 2)
    return round(base, 2)


@api.post("/orders")
async def create_order(payload: OrderIn, user=Depends(get_current_user)):
    rt = await db.report_types.find_one({"slug": payload.report_slug})
    if not rt:
        raise HTTPException(404, "Report type not found")
    coupon = None
    if payload.coupon_code:
        coupon = await db.coupons.find_one({"code": payload.coupon_code.upper(), "active": True})
    amount = compute_amount(rt.get("price", 0), coupon)
    doc = {
        "user_id": str(user["_id"]),
        "user_email": user["email"],
        "report_slug": rt["slug"],
        "report_title": rt["title"],
        "birth_details": payload.birth_details,
        "amount": amount,
        "currency": rt.get("currency", "INR"),
        "coupon_code": (coupon or {}).get("code"),
        "status": "pending",
        "razorpay_order_id": f"order_{uuid.uuid4().hex[:16]}",
        "created_at": now_utc(),
    }
    res = await db.orders.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


def _mock_report_text(order: Dict[str, Any]) -> str:
    bd = order.get("birth_details", {})
    name = bd.get("name", "Seeker")
    return f"""
    <b>{order['report_title']}</b><br/><br/>
    Prepared for: {name}<br/>
    Date of Birth: {bd.get('date','—')}<br/>
    Time of Birth: {bd.get('time','—')}<br/>
    Place of Birth: {bd.get('place','—')}<br/><br/>
    <b>Ascendant &amp; Moon Sign</b><br/>
    Based on the sidereal Vedic system, your ascendant reveals a magnetic
    presence combined with contemplative depth. Your Moon sign colours emotional
    life with quiet intensity and inner clarity.<br/><br/>
    <b>Dasha Analysis</b><br/>
    The Vimshottari Mahadasha currently in operation blends the wisdom of Jupiter
    with the discipline of Saturn. This period favours slow, foundational
    growth — study, patient investment, and long-term relationships.<br/><br/>
    <b>Career &amp; Finance</b><br/>
    Your 10th house indicates leadership qualities tempered by service. Ventures
    tied to knowledge, healing, technology, or the fine arts will prosper in the
    coming 18 months.<br/><br/>
    <b>Relationships</b><br/>
    Venus is well-placed, promising a deeply harmonious partnership. Timing
    favours meaningful commitments after the transit of Jupiter into the 7th
    house next year.<br/><br/>
    <b>Health &amp; Well-being</b><br/>
    Cultivate rhythms of rest and yogic breathing. Attention to digestion and
    the nervous system will pay long dividends.<br/><br/>
    <b>Remedies</b><br/>
    Chant the Gayatri mantra at sunrise. Offer water to the Sun on Sundays.
    Wear a yellow sapphire (only after professional consultation).<br/><br/>
    <i>This report is prepared by the Cosmic Hora Vedic astrology engine.</i>
    """


async def _generate_and_store_report(order_id: ObjectId) -> None:
    order = await db.orders.find_one({"_id": order_id})
    if not order:
        return
    ext_calc = os.environ.get("EXTERNAL_CALCULATE_API", "").strip()
    ext_rep = os.environ.get("EXTERNAL_REPORT_API", "").strip()
    report_text = None
    calc_json: Dict[str, Any] = {}
    if ext_calc and ext_rep:
        try:
            async with httpx.AsyncClient(timeout=30) as c:
                r1 = await c.post(ext_calc, json=order.get("birth_details", {}))
                r1.raise_for_status()
                calc_json = r1.json()
                r2 = await c.post(ext_rep, json={"calculation": calc_json,
                                                 "report_type": order["report_slug"]})
                r2.raise_for_status()
                report_text = r2.json().get("report") or r2.text
        except Exception as e:
            logger.warning("External API failed, using mock: %s", e)
    if not report_text:
        report_text = _mock_report_text(order)
    await db.orders.update_one(
        {"_id": order_id},
        {"$set": {"report_text": report_text, "calc_json": calc_json,
                  "report_generated_at": now_utc(), "status": "completed"}},
    )
    # Mock email delivery — logged
    logger.info("[MOCKED EMAIL] Report sent to %s for order %s",
                order.get("user_email"), str(order_id))
    await db.email_log.insert_one({
        "to": order.get("user_email"),
        "subject": f"Your {order['report_title']} is ready",
        "order_id": str(order_id),
        "sent_at": now_utc(),
        "mocked": True,
    })


@api.post("/orders/{order_id}/pay")
async def pay_order(order_id: str, payload: PayIn, user=Depends(get_current_user)):
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": str(user["_id"])})
    if not order:
        raise HTTPException(404, "Order not found")
    if order["status"] != "pending":
        return serialize_doc(order)
    await db.orders.update_one(
        {"_id": order["_id"]},
        {"$set": {
            "status": "paid",
            "payment_id": payload.payment_id or f"pay_{uuid.uuid4().hex[:16]}",
            "paid_at": now_utc(),
        }},
    )
    await _generate_and_store_report(order["_id"])
    order = await db.orders.find_one({"_id": order["_id"]})
    return serialize_doc(order)


@api.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    items = await db.orders.find({"user_id": str(user["_id"])}).sort("created_at", -1).to_list(200)
    for i in items:
        i.pop("report_text", None)
        i.pop("calc_json", None)
    return [serialize_doc(i) for i in items]


@api.get("/orders/{order_id}")
async def get_my_order(order_id: str, user=Depends(get_current_user)):
    order = await db.orders.find_one({"_id": ObjectId(order_id), "user_id": str(user["_id"])})
    if not order:
        raise HTTPException(404, "Order not found")
    return serialize_doc(order)


@api.get("/orders/{order_id}/pdf")
async def order_pdf(order_id: str, user=Depends(get_current_user)):
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(404, "Order not found")
    if order.get("user_id") != str(user["_id"]) and user.get("role") != "admin":
        raise HTTPException(403, "Forbidden")
    if order.get("status") != "completed":
        raise HTTPException(400, "Report not yet generated")

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=0.9 * inch, rightMargin=0.9 * inch,
                            topMargin=1 * inch, bottomMargin=1 * inch)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Brand", fontName="Times-Roman", fontSize=28,
                              leading=32, textColor=colors.HexColor("#3A302A"),
                              alignment=1))
    styles.add(ParagraphStyle(name="Sub", fontName="Times-Italic", fontSize=12,
                              textColor=colors.HexColor("#B89764"), alignment=1))
    body = ParagraphStyle(name="Body", parent=styles["BodyText"],
                          fontName="Times-Roman", fontSize=11.5, leading=17,
                          textColor=colors.HexColor("#1F1D1A"))
    story = [
        Paragraph("COSMIC HORA", styles["Brand"]),
        Paragraph("Vedic Astrology Report", styles["Sub"]),
        Spacer(1, 0.4 * inch),
        Paragraph(order.get("report_text", "No content"), body),
        Spacer(1, 0.3 * inch),
        Paragraph(f"Order ID: {str(order['_id'])}  •  Generated: "
                  f"{order.get('report_generated_at', now_utc()).isoformat() if isinstance(order.get('report_generated_at'), datetime) else order.get('report_generated_at','')}", body),
    ]
    doc.build(story)
    buf.seek(0)
    fname = f"cosmic-hora-{order['report_slug']}-{str(order['_id'])[-6:]}.pdf"
    return StreamingResponse(buf, media_type="application/pdf",
                             headers={"Content-Disposition": f'attachment; filename="{fname}"'})


# ── Admin orders / users / analytics ────────────────────────────────────────
@api.get("/admin/orders")
async def admin_orders(admin=Depends(require_admin)):
    items = await db.orders.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(i) for i in items]


@api.get("/admin/users")
async def admin_users(admin=Depends(require_admin)):
    items = await db.users.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(i) for i in items]


@api.get("/admin/analytics")
async def admin_analytics(admin=Depends(require_admin)):
    total_users = await db.users.count_documents({})
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"status": {"$in": ["paid", "completed"]}})
    pipe = [{"$match": {"status": {"$in": ["paid", "completed"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}]
    rev_agg = await db.orders.aggregate(pipe).to_list(1)
    revenue = rev_agg[0]["total"] if rev_agg else 0

    # revenue by day (last 14 days)
    since = now_utc() - timedelta(days=14)
    daily = []
    days_agg = await db.orders.aggregate([
        {"$match": {"status": {"$in": ["paid", "completed"]}, "created_at": {"$gte": since}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
            "revenue": {"$sum": "$amount"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]).to_list(50)
    for d in days_agg:
        daily.append({"date": d["_id"], "revenue": d["revenue"], "count": d["count"]})

    # orders by report type
    by_type = await db.orders.aggregate([
        {"$group": {"_id": "$report_title", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 8}
    ]).to_list(20)
    by_type = [{"name": b["_id"] or "Unknown", "count": b["count"]} for b in by_type]

    return {"total_users": total_users, "total_orders": total_orders,
            "paid_orders": paid_orders, "revenue": revenue,
            "daily": daily, "by_type": by_type}


# ── Coupons ─────────────────────────────────────────────────────────────────
@api.get("/admin/coupons")
async def list_coupons(admin=Depends(require_admin)):
    items = await db.coupons.find({}).sort("code", 1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.post("/admin/coupons")
async def create_coupon(payload: CouponIn, admin=Depends(require_admin)):
    doc = payload.model_dump()
    doc["code"] = doc["code"].upper()
    if await db.coupons.find_one({"code": doc["code"]}):
        raise HTTPException(400, "Coupon code exists")
    doc["created_at"] = now_utc()
    res = await db.coupons.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/admin/coupons/{cid}")
async def update_coupon(cid: str, payload: CouponIn, admin=Depends(require_admin)):
    upd = payload.model_dump()
    upd["code"] = upd["code"].upper()
    await db.coupons.update_one({"_id": ObjectId(cid)}, {"$set": upd})
    return serialize_doc(await db.coupons.find_one({"_id": ObjectId(cid)}))


@api.delete("/admin/coupons/{cid}")
async def delete_coupon(cid: str, admin=Depends(require_admin)):
    await db.coupons.delete_one({"_id": ObjectId(cid)})
    return {"ok": True}


@api.post("/coupons/validate")
async def validate_coupon(code: str):
    coupon = await db.coupons.find_one({"code": code.upper(), "active": True})
    if not coupon:
        raise HTTPException(404, "Invalid or expired coupon")
    return serialize_doc(coupon)


# ── Blogs ───────────────────────────────────────────────────────────────────
@api.get("/blogs")
async def list_blogs():
    items = await db.blogs.find({"published": True}).sort("created_at", -1).to_list(200)
    return [serialize_doc(i) for i in items]


@api.get("/blogs/{slug}")
async def get_blog(slug: str):
    b = await db.blogs.find_one({"slug": slug, "published": True})
    if not b:
        raise HTTPException(404, "Blog not found")
    return serialize_doc(b)


@api.get("/admin/blogs")
async def admin_list_blogs(admin=Depends(require_admin)):
    items = await db.blogs.find({}).sort("created_at", -1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.post("/admin/blogs")
async def create_blog(payload: BlogIn, admin=Depends(require_admin)):
    if await db.blogs.find_one({"slug": payload.slug}):
        raise HTTPException(400, "Slug exists")
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    res = await db.blogs.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/admin/blogs/{bid}")
async def update_blog(bid: str, payload: BlogIn, admin=Depends(require_admin)):
    await db.blogs.update_one({"_id": ObjectId(bid)}, {"$set": payload.model_dump()})
    return serialize_doc(await db.blogs.find_one({"_id": ObjectId(bid)}))


@api.delete("/admin/blogs/{bid}")
async def delete_blog(bid: str, admin=Depends(require_admin)):
    await db.blogs.delete_one({"_id": ObjectId(bid)})
    return {"ok": True}


# ── Testimonials ────────────────────────────────────────────────────────────
@api.get("/testimonials")
async def list_testimonials():
    items = await db.testimonials.find({"active": True}).sort("created_at", -1).to_list(50)
    return [serialize_doc(i) for i in items]


@api.get("/admin/testimonials")
async def admin_list_testimonials(admin=Depends(require_admin)):
    items = await db.testimonials.find({}).sort("created_at", -1).to_list(200)
    return [serialize_doc(i) for i in items]


@api.post("/admin/testimonials")
async def create_testimonial(payload: TestimonialIn, admin=Depends(require_admin)):
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    res = await db.testimonials.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/admin/testimonials/{tid}")
async def update_testimonial(tid: str, payload: TestimonialIn, admin=Depends(require_admin)):
    await db.testimonials.update_one({"_id": ObjectId(tid)}, {"$set": payload.model_dump()})
    return serialize_doc(await db.testimonials.find_one({"_id": ObjectId(tid)}))


@api.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin=Depends(require_admin)):
    await db.testimonials.delete_one({"_id": ObjectId(tid)})
    return {"ok": True}


# ── FAQs ────────────────────────────────────────────────────────────────────
@api.get("/faqs")
async def list_faqs():
    items = await db.faqs.find({"active": True}).sort("order", 1).to_list(200)
    return [serialize_doc(i) for i in items]


@api.get("/admin/faqs")
async def admin_list_faqs(admin=Depends(require_admin)):
    items = await db.faqs.find({}).sort("order", 1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.post("/admin/faqs")
async def create_faq(payload: FAQIn, admin=Depends(require_admin)):
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    res = await db.faqs.insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_doc(doc)


@api.put("/admin/faqs/{fid}")
async def update_faq(fid: str, payload: FAQIn, admin=Depends(require_admin)):
    await db.faqs.update_one({"_id": ObjectId(fid)}, {"$set": payload.model_dump()})
    return serialize_doc(await db.faqs.find_one({"_id": ObjectId(fid)}))


@api.delete("/admin/faqs/{fid}")
async def delete_faq(fid: str, admin=Depends(require_admin)):
    await db.faqs.delete_one({"_id": ObjectId(fid)})
    return {"ok": True}


# ── Contact + Appointments ──────────────────────────────────────────────────
@api.post("/contact")
async def contact_submit(payload: ContactIn):
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    doc["status"] = "new"
    await db.contacts.insert_one(doc)
    return {"ok": True}


@api.get("/admin/contacts")
async def admin_list_contacts(admin=Depends(require_admin)):
    items = await db.contacts.find({}).sort("created_at", -1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.delete("/admin/contacts/{cid}")
async def delete_contact(cid: str, admin=Depends(require_admin)):
    await db.contacts.delete_one({"_id": ObjectId(cid)})
    return {"ok": True}


@api.post("/appointments")
async def create_appointment(payload: AppointmentIn):
    doc = payload.model_dump()
    doc["created_at"] = now_utc()
    doc["status"] = "requested"
    await db.appointments.insert_one(doc)
    return {"ok": True}


@api.get("/admin/appointments")
async def admin_list_appointments(admin=Depends(require_admin)):
    items = await db.appointments.find({}).sort("created_at", -1).to_list(500)
    return [serialize_doc(i) for i in items]


@api.delete("/admin/appointments/{aid}")
async def delete_appointment(aid: str, admin=Depends(require_admin)):
    await db.appointments.delete_one({"_id": ObjectId(aid)})
    return {"ok": True}


# ── Settings (key/value CMS: site content, prompts, email tpl, api keys) ────
@api.get("/settings/{key}")
async def get_public_setting(key: str):
    # only expose non-secret keys
    if key.startswith("secret_") or "api_key" in key.lower():
        raise HTTPException(403, "Not public")
    s = await db.settings.find_one({"key": key})
    return {"key": key, "value": (s or {}).get("value")}


@api.get("/admin/settings")
async def admin_list_settings(admin=Depends(require_admin)):
    items = await db.settings.find({}).to_list(500)
    return [serialize_doc(i) for i in items]


@api.put("/admin/settings/{key}")
async def upsert_setting(key: str, payload: SettingsIn, admin=Depends(require_admin)):
    await db.settings.update_one(
        {"key": key},
        {"$set": {"key": key, "value": payload.value, "updated_at": now_utc()}},
        upsert=True,
    )
    s = await db.settings.find_one({"key": key})
    return serialize_doc(s)


# ────────────────────────────────────────────────────────────────────────────
# App wiring, seed, indexes
# ────────────────────────────────────────────────────────────────────────────
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DEFAULT_REPORTS = [
    ("complete-horoscope", "Complete Horoscope",
     "A definitive lifetime chart reading.",
     "The full sidereal Vedic natal chart with all planetary positions, dashas, yogas, and life predictions.",
     2999, "sparkles"),
    ("marriage-compatibility", "Marriage Compatibility",
     "Kundali Milan & Guna analysis.",
     "Ashtakoot matching, dosha analysis, and long-term compatibility guidance for two natal charts.",
     1999, "heart"),
    ("career-analysis", "Career Analysis",
     "Discover your vocational dharma.",
     "10th house, 6th house, planetary strengths and dasha timing to guide career decisions.",
     1499, "briefcase"),
    ("finance-wealth", "Finance & Wealth",
     "Money houses, timing & remedies.",
     "2nd, 5th, 9th and 11th house synthesis with dhana yoga assessment.",
     1499, "banknote"),
    ("business-success", "Business Success",
     "Timing ventures and partnerships.",
     "Muhurta guidance, partner compatibility and business dasha windows.",
     1799, "trending-up"),
    ("education", "Education",
     "Study, focus, and higher learning.",
     "Mercury, Jupiter, and 4th/5th/9th house evaluation for academic direction.",
     999, "graduation-cap"),
    ("health", "Health",
     "Body, mind, and prevention.",
     "6th house, ascendant lord and dasha risks with ayurvedic remedy suggestions.",
     1299, "heart-pulse"),
    ("foreign-settlement", "Foreign Settlement",
     "Migration timing & opportunity.",
     "12th, 9th and 7th house analysis with dasha windows favoring foreign lands.",
     1599, "plane"),
    ("child-birth", "Child Birth",
     "Santan yoga and timing.",
     "5th house analysis, Jupiter dasha windows, and remedies for progeny.",
     1499, "baby"),
    ("yearly-predictions", "Yearly Predictions",
     "12-month personalised forecast.",
     "Varshaphala, transits and dasha combined for a month-by-month forecast.",
     1799, "calendar"),
    ("monthly-predictions", "Monthly Predictions",
     "This month's cosmic weather.",
     "Transit analysis and lunar timing for the current month.",
     499, "moon"),
    ("custom-report", "Custom Report",
     "Ask a specific question.",
     "Bring a specific life question — career, relocation, spiritual practice — and receive a bespoke reading.",
     2499, "wand"),
]


async def seed_defaults():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@cosmichora.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Cosmic Hora Admin",
            "role": "admin",
            "mobile": "",
            "created_at": now_utc(),
        })
        logger.info("Seeded admin user: %s", admin_email)
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password), "role": "admin"}},
        )

    if await db.report_types.count_documents({}) == 0:
        for slug, title, tagline, desc, price, icon in DEFAULT_REPORTS:
            await db.report_types.insert_one({
                "slug": slug, "title": title, "tagline": tagline, "description": desc,
                "price": price, "currency": "INR", "duration_days": 1,
                "image_url": "", "icon": icon, "highlights": [
                    "AI-generated in minutes", "PDF delivery", "Vedic sidereal system"],
                "active": True, "prompt_template": "",
                "created_at": now_utc(),
            })

    if await db.testimonials.count_documents({}) == 0:
        seeds = [
            ("Ananya Sharma", "Product Designer, Bengaluru",
             "The Complete Horoscope was startlingly precise. It felt like a private letter from the cosmos.", 5),
            ("Rohan Mehta", "Founder, Mumbai",
             "I used the Business Success report to time our launch. Everything unfolded exactly as predicted.", 5),
            ("Kavita Iyer", "Doctor, Chennai",
             "Beautifully written, deeply insightful. My Marriage Compatibility report saved me a lot of confusion.", 5),
        ]
        for n, r, q, s in seeds:
            await db.testimonials.insert_one({"name": n, "role": r, "quote": q, "rating": s,
                                              "avatar": "", "active": True,
                                              "created_at": now_utc()})

    if await db.faqs.count_documents({}) == 0:
        faqs = [
            ("How is the report generated?",
             "Reports are produced by our AI astrology engine trained on classical Vedic texts and modern computational astronomy. No human astrologer is involved unless you book a live consultation.",
             "General", 1),
            ("How long does it take to receive my report?",
             "Once your payment is complete, the PDF is generated within a few minutes and delivered to your email as well as your dashboard.",
             "Delivery", 2),
            ("Is my personal data safe?",
             "All birth details are encrypted at rest and never shared with third parties. You can request deletion anytime from your dashboard.",
             "Privacy", 3),
            ("Can I get a refund?",
             "Yes — refunds are available within 24 hours of purchase if the report has not yet been generated. See our Refund Policy for details.",
             "Payments", 4),
            ("Do you offer live astrologer consultations?",
             "Yes. Please book an appointment via the Schedule an Appointment page.",
             "Consultation", 5),
        ]
        for q, a, cat, o in faqs:
            await db.faqs.insert_one({"question": q, "answer": a, "category": cat,
                                      "order": o, "active": True, "created_at": now_utc()})

    if await db.blogs.count_documents({}) == 0:
        posts = [
            ("understanding-vedic-astrology",
             "Understanding Vedic Astrology — A Modern Primer",
             "How the ancient sidereal system speaks to the questions of our contemporary life.",
             "Vedic astrology, or Jyotish, is the study of the cosmos as a mirror of individual destiny. Unlike its Western counterpart, it uses the sidereal zodiac, anchoring itself to the fixed positions of the stars rather than the moving equinox. This subtle difference means that Vedic charts capture time as it truly is — shaped by long celestial cycles and precise planetary geometry.\n\nIn this primer, we walk through the twelve houses, the nine planets (Grahas), and the extraordinary system of Vimshottari Dashas — the planetary time-belts that govern our lifetimes. You will learn to read your own natal chart as a living document, one that opens new pages as the years unfold.",
             "Cosmic Hora Team", ["Basics", "Jyotish"]),
            ("dasha-system-explained",
             "The Vimshottari Dasha — How Time Moves Through You",
             "A deep dive into the 120-year planetary time cycle.",
             "The Vimshottari Dasha is one of the most sophisticated timing systems in world astrology. Beginning at your birth and unfolding over 120 years, it assigns each period of life to one of the nine planetary rulers. This article explores each Mahadasha and Antardasha, and how to identify the current chapter of your own story.",
             "Cosmic Hora Team", ["Timing", "Advanced"]),
            ("choosing-the-right-report",
             "How to Choose the Right Report for You",
             "A gentle guide to selecting from our library of 15 report types.",
             "Whether you are contemplating marriage, planning a career move, or simply seeking to understand yourself, we have a report designed for your question. Here is our compass to help you choose wisely.",
             "Cosmic Hora Team", ["Guide"]),
        ]
        for slug, title, exc, content, author, tags in posts:
            await db.blogs.insert_one({
                "slug": slug, "title": title, "excerpt": exc, "content": content,
                "author": author, "cover_image": "", "tags": tags, "published": True,
                "created_at": now_utc(),
            })

    if await db.coupons.count_documents({}) == 0:
        await db.coupons.insert_one({"code": "COSMIC20", "discount_percent": 20.0,
                                     "active": True, "max_uses": 0,
                                     "description": "Welcome offer — 20% off",
                                     "created_at": now_utc()})

    if await db.settings.count_documents({}) == 0:
        default_settings = [
            ("site.hero_headline", "The cosmos, translated."),
            ("site.hero_subheadline", "AI-crafted Vedic astrology reports, prepared with care and delivered in minutes."),
            ("site.tagline", "Ancient wisdom · Modern craft"),
            ("site.contact_email", "hello@cosmichora.com"),
            ("site.contact_phone", "+91 90000 00000"),
            ("email_template.report_ready", "Dear {name},\n\nYour {report_title} is ready. Download it from your dashboard.\n\n— Cosmic Hora"),
            ("prompt.default_report", "You are a Vedic astrologer. Given the calculation JSON, produce a detailed, well-structured report."),
            ("api_key.astrology_provider", ""),
        ]
        for k, v in default_settings:
            await db.settings.insert_one({"key": k, "value": v, "updated_at": now_utc()})


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.report_types.create_index("slug", unique=True)
    await db.blogs.create_index("slug", unique=True)
    await db.coupons.create_index("code", unique=True)
    await seed_defaults()
    logger.info("Cosmic Hora API ready.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()
