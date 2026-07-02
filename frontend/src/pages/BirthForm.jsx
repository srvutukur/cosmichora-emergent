import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export default function BirthForm() {
  const { slug } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [report, setReport] = useState(null);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    gender: "female",
    date: "",
    time: "",
    place: "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });
  const [coupon, setCoupon] = useState("");
  const [couponInfo, setCouponInfo] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/report-types/${slug}`).then((r) => setReport(r.data)).catch(() => toast.error("Report not found"));
  }, [slug]);

  const price = report?.price || 0;
  const discount = couponInfo?.discount_percent || 0;
  const finalAmount = Math.round(price * (1 - discount / 100));

  const applyCoupon = async () => {
    if (!coupon) return;
    try {
      const { data } = await api.post(`/coupons/validate?code=${encodeURIComponent(coupon)}`);
      setCouponInfo(data);
      toast.success(`Coupon ${data.code} applied — ${data.discount_percent}% off`);
    } catch (e) {
      setCouponInfo(null);
      toast.error(formatApiError(e));
    }
  };

  const validate = () => {
    for (const f of ["name", "date", "time", "place", "email", "mobile"]) {
      if (!form[f]) { toast.error(`Please provide ${f}`); return false; }
    }
    return true;
  };

  const createOrder = async () => {
    if (!user) {
      toast.error("Please sign in to continue");
      nav(`/login?next=/reports/${slug}`);
      return;
    }
    if (!validate()) return;
    setBusy(true);
    try {
      const { data } = await api.post("/orders", {
        report_slug: slug,
        birth_details: form,
        coupon_code: couponInfo?.code,
      });
      setOrder(data);
      setStep(2);
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setBusy(false); }
  };

  const mockPay = async () => {
    if (!order) return;
    setBusy(true);
    // Simulate Razorpay
    await new Promise((r) => setTimeout(r, 1400));
    try {
      const { data } = await api.post(`/orders/${order.id}/pay`, {
        payment_id: `pay_mock_${Date.now()}`,
      });
      setOrder(data);
      setStep(3);
      toast.success("Payment successful — generating your report");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setBusy(false); }
  };

  if (!report) {
    return <div className="max-w-3xl mx-auto px-6 py-40 text-center font-display text-2xl" style={{ color: "var(--charcoal)" }}>Loading…</div>;
  }

  return (
    <div data-testid="birth-form-page" className="max-w-6xl mx-auto px-6 md:px-12 py-20 grid lg:grid-cols-12 gap-14">
      {/* Left: summary */}
      <aside className="lg:col-span-5">
        <div className="sticky top-28">
          <div className="eyebrow mb-4">You are ordering</div>
          <h2 className="font-display font-light text-4xl tracking-tight" style={{ color: "var(--obsidian)" }}>
            {report.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
            {report.description}
          </p>
          <div className="mt-8 card-editorial">
            <div className="flex justify-between text-sm" style={{ color: "var(--charcoal)" }}>
              <span>Report fee</span>
              <span>₹{price}</span>
            </div>
            {couponInfo && (
              <div className="flex justify-between text-sm mt-3" style={{ color: "var(--brass)" }}>
                <span>Coupon ({couponInfo.code})</span>
                <span>− {discount}%</span>
              </div>
            )}
            <div className="mt-6 pt-6 flex justify-between items-baseline" style={{ borderTop: "1px solid rgba(58,48,42,0.1)" }}>
              <span className="eyebrow">Total</span>
              <span className="font-display text-3xl" style={{ color: "var(--espresso)" }}>₹{finalAmount}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Right: steps */}
      <section className="lg:col-span-7">
        <div className="flex items-center gap-6 mb-10 text-sm" style={{ color: "var(--charcoal)" }}>
          {["Birth Details", "Payment", "Delivered"].map((label, i) => {
            const n = i + 1;
            const active = step === n; const done = step > n;
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="inline-flex w-8 h-8 items-center justify-center rounded-full text-xs" style={{
                  background: done ? "var(--espresso)" : (active ? "var(--brass)" : "transparent"),
                  border: "1px solid rgba(58,48,42,0.2)",
                  color: (done || active) ? "var(--bone)" : "var(--charcoal)",
                }}>{done ? <Check size={14} /> : n}</span>
                <span style={{ color: active ? "var(--obsidian)" : "var(--charcoal)" }}>{label}</span>
                {i < 2 && <span className="w-8 h-px" style={{ background: "rgba(58,48,42,0.15)" }} />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div className="space-y-8 fade-up">
            <Field label="Full Name" id="name">
              <input data-testid="birth-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="As per birth records" />
            </Field>
            <div className="grid md:grid-cols-2 gap-8">
              <Field label="Gender" id="gender">
                <select data-testid="birth-gender-select" className="input-editorial" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Date of Birth" id="dob">
                <input data-testid="birth-dob-input" type="date" className="input-editorial" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="Exact Time of Birth" id="tob">
                <input data-testid="birth-tob-input" type="time" className="input-editorial" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </Field>
              <Field label="Place of Birth" id="pob">
                <input data-testid="birth-place-input" className="input-editorial" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="City, Country" />
              </Field>
              <Field label="Email" id="email">
                <input data-testid="birth-email-input" type="email" className="input-editorial" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Mobile Number" id="mobile">
                <input data-testid="birth-mobile-input" className="input-editorial" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </Field>
            </div>

            <div className="flex gap-3 items-end">
              <Field label="Have a coupon?" id="coupon">
                <input data-testid="coupon-input" className="input-editorial" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="COSMIC20" />
              </Field>
              <button type="button" className="btn-secondary mb-1" onClick={applyCoupon} data-testid="coupon-apply-btn">Apply</button>
            </div>

            <button
              type="button"
              data-testid="birth-continue-btn"
              className="btn-primary"
              disabled={busy}
              onClick={createOrder}
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : null}
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && order && (
          <div className="fade-up card-editorial">
            <div className="eyebrow mb-2">Checkout · Mocked Razorpay</div>
            <h3 className="font-display text-3xl" style={{ color: "var(--obsidian)" }}>Confirm your payment</h3>
            <p className="mt-4 text-sm" style={{ color: "var(--charcoal)" }}>
              Razorpay integration is mocked in this environment. Clicking below simulates a
              successful checkout and triggers report generation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><div className="eyebrow mb-1">Order ID</div><div>{order.razorpay_order_id}</div></div>
              <div><div className="eyebrow mb-1">Amount</div><div>₹{order.amount}</div></div>
            </div>
            <button data-testid="pay-btn" onClick={mockPay} className="btn-primary mt-8" disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" size={16} /> Processing…</> : `Pay ₹${order.amount}`}
            </button>
          </div>
        )}

        {step === 3 && order && (
          <div className="fade-up text-center py-8">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-full mb-6" style={{ background: "var(--espresso)" }}>
              <Check size={26} color="#F9F8F3" />
            </div>
            <h3 className="font-display text-4xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              Your report is ready.
            </h3>
            <p className="mt-4 max-w-md mx-auto text-sm" style={{ color: "var(--charcoal)" }}>
              We have delivered a PDF copy to <b>{order.user_email}</b> (mocked in this
              environment) and saved it to your dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a data-testid="download-pdf-btn" className="btn-primary" href={`${api.defaults.baseURL}/orders/${order.id}/pdf`} target="_blank" rel="noreferrer">
                Download PDF
              </a>
              <button data-testid="go-dashboard-btn" className="btn-secondary" onClick={() => nav("/dashboard")}>
                Go to dashboard
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, id, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
