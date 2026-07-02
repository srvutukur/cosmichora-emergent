"""COSMIC HORA backend API test suite.
Covers: health, auth (register/login/me/logout), report-types (public+admin),
orders (create/pay/mine/pdf), coupons (validate + discount math), blogs,
testimonials, faqs, contact, appointment, analytics, settings, admin authz.
"""
import io
import os
import uuid
import pytest
import requests

BASE = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE:
    # fallback for pytest when frontend .env not in env - read it directly
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL"):
                BASE = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE}/api"

ADMIN_EMAIL = "admin@cosmichora.com"
ADMIN_PASSWORD = "Admin@Cosmic2026"


# ── Fixtures ─────────────────────────────────────────────────────────────
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def user_creds():
    email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
    pw = "User@Cosmic2026"
    r = requests.post(f"{API}/auth/register",
                      json={"email": email, "password": pw,
                            "name": "Test User", "mobile": "9999999999"})
    assert r.status_code == 200, f"Register failed: {r.text}"
    data = r.json()
    return {"email": email, "password": pw, "token": data["access_token"],
            "id": data["user"]["id"]}


@pytest.fixture(scope="session")
def user_headers(user_creds):
    return {"Authorization": f"Bearer {user_creds['token']}"}


# ── Health ───────────────────────────────────────────────────────────────
def test_health():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    body = r.json()
    assert body["service"] == "cosmic-hora"
    assert body["status"] == "ok"


# ── Auth ─────────────────────────────────────────────────────────────────
def test_admin_login_returns_jwt(admin_token):
    assert isinstance(admin_token, str) and len(admin_token) > 50


def test_auth_me(user_headers, user_creds):
    r = requests.get(f"{API}/auth/me", headers=user_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == user_creds["email"]
    assert body["role"] == "user"
    assert "password_hash" not in body


def test_auth_me_unauth():
    r = requests.get(f"{API}/auth/me")
    assert r.status_code in (401, 403)


def test_logout(user_headers):
    r = requests.post(f"{API}/auth/logout", headers=user_headers)
    assert r.status_code == 200


def test_register_duplicate(user_creds):
    r = requests.post(f"{API}/auth/register",
                      json={"email": user_creds["email"], "password": "SomePass@123",
                            "name": "dup"})
    assert r.status_code == 400


def test_login_invalid():
    r = requests.post(f"{API}/auth/login",
                      json={"email": "nobody@x.com", "password": "wrong"})
    assert r.status_code == 401


# ── Report Types ─────────────────────────────────────────────────────────
def test_report_types_seeded():
    r = requests.get(f"{API}/report-types")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 15, f"Expected 15+ report types, got {len(items)}"
    slugs = {i["slug"] for i in items}
    assert "complete-horoscope" in slugs


def test_report_type_detail():
    r = requests.get(f"{API}/report-types/complete-horoscope")
    assert r.status_code == 200
    body = r.json()
    assert body["slug"] == "complete-horoscope"
    assert "price" in body


def test_report_type_404():
    r = requests.get(f"{API}/report-types/does-not-exist-xyz")
    assert r.status_code == 404


# ── Admin authz ──────────────────────────────────────────────────────────
def test_admin_route_requires_auth():
    r = requests.get(f"{API}/admin/analytics")
    assert r.status_code in (401, 403)


def test_admin_route_forbidden_for_user(user_headers):
    r = requests.get(f"{API}/admin/analytics", headers=user_headers)
    assert r.status_code == 403


# ── Admin CRUD on report-types ───────────────────────────────────────────
def test_admin_report_type_crud(admin_headers):
    slug = f"test-{uuid.uuid4().hex[:6]}"
    payload = {"slug": slug, "title": "TEST Report", "tagline": "t",
               "description": "long description here", "price": 100,
               "currency": "INR", "duration_days": 1,
               "image_url": "", "icon": "star",
               "highlights": ["a"], "active": True,
               "prompt_template": ""}
    r = requests.post(f"{API}/admin/report-types", json=payload,
                      headers=admin_headers)
    assert r.status_code == 200, r.text
    rid = r.json()["id"]

    # verify GET
    g = requests.get(f"{API}/report-types/{slug}")
    assert g.status_code == 200
    assert g.json()["title"] == "TEST Report"

    # update
    payload["title"] = "TEST Updated"
    u = requests.put(f"{API}/admin/report-types/{rid}", json=payload,
                     headers=admin_headers)
    assert u.status_code == 200
    assert u.json()["title"] == "TEST Updated"

    # delete
    d = requests.delete(f"{API}/admin/report-types/{rid}",
                        headers=admin_headers)
    assert d.status_code == 200


# ── Coupons ──────────────────────────────────────────────────────────────
def test_coupon_validate_cosmic20():
    r = requests.post(f"{API}/coupons/validate?code=COSMIC20")
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["code"] == "COSMIC20"
    assert body["discount_percent"] == 20


def test_coupon_invalid():
    r = requests.post(f"{API}/coupons/validate?code=NOPE_XYZ")
    assert r.status_code == 404


# ── Order lifecycle (main flow) ──────────────────────────────────────────
@pytest.fixture(scope="session")
def paid_order(user_headers):
    # create
    payload = {
        "report_slug": "complete-horoscope",
        "birth_details": {
            "name": "Test Seeker",
            "date": "1990-05-15",
            "time": "14:30",
            "place": "Mumbai, India",
            "email": "seeker@test.com",
            "mobile": "9876543210",
        },
        "coupon_code": "COSMIC20",
    }
    r = requests.post(f"{API}/orders", json=payload, headers=user_headers)
    assert r.status_code == 200, r.text
    order = r.json()
    # Assert discount applied: 2999 * 0.8 = 2399.20
    assert order["amount"] == pytest.approx(2399.20, rel=0.01), \
        f"Expected discounted 2399.20, got {order['amount']}"
    assert order["status"] == "pending"
    assert order["coupon_code"] == "COSMIC20"
    order_id = order["id"]

    # pay
    p = requests.post(f"{API}/orders/{order_id}/pay",
                      json={"payment_id": "pay_mock_test"},
                      headers=user_headers)
    assert p.status_code == 200, p.text
    paid = p.json()
    assert paid["status"] == "completed"  # generation is synchronous
    return paid


def test_order_created_and_paid(paid_order):
    assert paid_order["status"] == "completed"
    assert "payment_id" in paid_order


def test_order_pdf_download(paid_order, user_headers):
    r = requests.get(f"{API}/orders/{paid_order['id']}/pdf",
                     headers=user_headers)
    assert r.status_code == 200, r.text
    assert r.headers["content-type"].startswith("application/pdf")
    assert r.content[:4] == b"%PDF"


def test_orders_mine(paid_order, user_headers):
    r = requests.get(f"{API}/orders/mine", headers=user_headers)
    assert r.status_code == 200
    ids = [o["id"] for o in r.json()]
    assert paid_order["id"] in ids


def test_order_no_coupon(user_headers):
    payload = {
        "report_slug": "complete-horoscope",
        "birth_details": {"name": "n", "date": "1990-01-01",
                          "time": "10:00", "place": "Delhi"},
    }
    r = requests.post(f"{API}/orders", json=payload, headers=user_headers)
    assert r.status_code == 200
    assert r.json()["amount"] == 2999


def test_order_pdf_forbidden_other_user(paid_order):
    # register other user
    email = f"other_{uuid.uuid4().hex[:6]}@example.com"
    reg = requests.post(f"{API}/auth/register",
                        json={"email": email, "password": "Xx@12345",
                              "name": "Other"})
    tok = reg.json()["access_token"]
    r = requests.get(f"{API}/orders/{paid_order['id']}/pdf",
                     headers={"Authorization": f"Bearer {tok}"})
    assert r.status_code in (403, 404)


# ── Blogs ────────────────────────────────────────────────────────────────
def test_blogs_list():
    r = requests.get(f"{API}/blogs")
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 1
    slugs = {b["slug"] for b in items}
    assert "understanding-vedic-astrology" in slugs


def test_blog_detail():
    r = requests.get(f"{API}/blogs/understanding-vedic-astrology")
    assert r.status_code == 200
    b = r.json()
    assert b["slug"] == "understanding-vedic-astrology"
    assert "content" in b


def test_admin_blog_crud(admin_headers):
    slug = f"test-blog-{uuid.uuid4().hex[:6]}"
    payload = {"slug": slug, "title": "T", "excerpt": "e", "content": "c",
               "author": "a", "cover_image": "", "tags": ["x"],
               "published": True}
    r = requests.post(f"{API}/admin/blogs", json=payload,
                      headers=admin_headers)
    assert r.status_code == 200, r.text
    bid = r.json()["id"]
    d = requests.delete(f"{API}/admin/blogs/{bid}", headers=admin_headers)
    assert d.status_code == 200


# ── Testimonials & FAQs ─────────────────────────────────────────────────
def test_testimonials():
    r = requests.get(f"{API}/testimonials")
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_faqs():
    r = requests.get(f"{API}/faqs")
    assert r.status_code == 200
    assert len(r.json()) >= 1


# ── Contact / Appointment ────────────────────────────────────────────────
def test_contact_submission(admin_headers):
    r = requests.post(f"{API}/contact",
                      json={"name": "TEST_c", "email": "c@example.com",
                            "subject": "hi", "message": "hello"})
    assert r.status_code == 200
    # admin can list
    a = requests.get(f"{API}/admin/contacts", headers=admin_headers)
    assert a.status_code == 200
    emails = [c["email"] for c in a.json()]
    assert "c@example.com" in emails


def test_appointment(admin_headers):
    r = requests.post(f"{API}/appointments",
                      json={"name": "TEST_a", "email": "a@example.com",
                            "mobile": "9", "date": "2026-08-15",
                            "time": "10:00", "topic": "career"})
    assert r.status_code == 200
    a = requests.get(f"{API}/admin/appointments", headers=admin_headers)
    assert a.status_code == 200


# ── Analytics ────────────────────────────────────────────────────────────
def test_admin_analytics(admin_headers, paid_order):
    r = requests.get(f"{API}/admin/analytics", headers=admin_headers)
    assert r.status_code == 200, r.text
    body = r.json()
    for k in ("total_users", "total_orders", "paid_orders",
              "revenue", "daily", "by_type"):
        assert k in body, f"Missing key {k}"
    assert body["total_users"] >= 1
    assert body["paid_orders"] >= 1
    assert isinstance(body["daily"], list)
    assert isinstance(body["by_type"], list)


# ── Settings ─────────────────────────────────────────────────────────────
def test_settings_upsert(admin_headers):
    key = f"test_key_{uuid.uuid4().hex[:6]}"
    r = requests.put(f"{API}/admin/settings/{key}",
                     json={"key": key, "value": {"foo": "bar"}},
                     headers=admin_headers)
    assert r.status_code == 200, r.text
    assert r.json()["value"] == {"foo": "bar"}

    lst = requests.get(f"{API}/admin/settings", headers=admin_headers)
    assert lst.status_code == 200
    keys = [s["key"] for s in lst.json()]
    assert key in keys
