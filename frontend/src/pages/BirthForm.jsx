import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export default function BirthForm() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { t, tReport } = useI18n();
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

  const displayReport = report ? tReport(report) : null;
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
      toast.error(t("bf_signin_first"));
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
    await new Promise((r) => setTimeout(r, 1400));
    try {
      const { data } = await api.post(`/orders/${order.id}/pay`, {
        payment_id: `pay_mock_${Date.now()}`,
      });
      setOrder(data);
      setStep(3);
      toast.success("Payment successful");
    } catch (e) {
      toast.error(formatApiError(e));
    } finally { setBusy(false); }
  };

  if (!displayReport) {
    return <div className="max-w-3xl mx-auto px-6 py-40 text-center font-display text-2xl" style={{ color: "var(--charcoal)" }}>{t("loading")}</div>;
  }

  return (
    <div data-testid="birth-form-page" className="max-w-6xl mx-auto px-6 md:px-12 py-20 grid lg:grid-cols-12 gap-14">
      <aside className="lg:col-span-5">
        <div className="sticky top-28">
          <div className="eyebrow mb-4">{t("bf_ordering")}</div>
          <h2 className="font-display font-light text-4xl tracking-tight" style={{ color: "var(--obsidian)" }}>
            {displayReport.title}
          </h2>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>
            {displayReport.description}
          </p>
          <div className="mt-8 card-editorial">
            <div className="flex justify-between text-sm" style={{ color: "var(--charcoal)" }}>
              <span>{t("bf_fee")}</span>
              <span>₹{price}</span>
            </div>
            {couponInfo && (
              <div className="flex justify-between text-sm mt-3" style={{ color: "var(--brass)" }}>
                <span>{t("bf_coupon")} ({couponInfo.code})</span>
                <span>− {discount}%</span>
              </div>
            )}
            <div className="mt-6 pt-6 flex justify-between items-baseline" style={{ borderTop: "1px solid rgba(58,48,42,0.1)" }}>
              <span className="eyebrow">{t("bf_total")}</span>
              <span className="font-display text-3xl" style={{ color: "var(--espresso)" }}>₹{finalAmount}</span>
            </div>
          </div>
        </div>
      </aside>

      <section className="lg:col-span-7">
        <div className="flex items-center gap-6 mb-10 text-sm" style={{ color: "var(--charcoal)" }}>
          {[t("bf_step_1"), t("bf_step_2"), t("bf_step_3")].map((label, i) => {
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
            <Field label={t("bf_name")}>
              <input data-testid="birth-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("bf_name_ph")} />
            </Field>
            <div className="grid md:grid-cols-2 gap-8">
              <Field label={t("bf_gender")}>
                <select data-testid="birth-gender-select" className="input-editorial" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <option value="female">{t("bf_female")}</option>
                  <option value="male">{t("bf_male")}</option>
                  <option value="other">{t("bf_other")}</option>
                </select>
              </Field>
              <Field label={t("bf_dob")}>
                <input data-testid="birth-dob-input" type="date" className="input-editorial" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label={t("bf_tob")}>
                <input data-testid="birth-tob-input" type="time" className="input-editorial" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </Field>
              <Field label={t("bf_pob")}>
                <input data-testid="birth-place-input" className="input-editorial" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder={t("bf_pob_ph")} />
              </Field>
              <Field label={t("bf_email")}>
                <input data-testid="birth-email-input" type="email" className="input-editorial" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label={t("bf_mobile")}>
                <input data-testid="birth-mobile-input" className="input-editorial" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
              </Field>
            </div>

            <div className="flex gap-3 items-end">
              <Field label={t("bf_coupon_q")}>
                <input data-testid="coupon-input" className="input-editorial" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="COSMIC20" />
              </Field>
              <button type="button" className="btn-secondary mb-1" onClick={applyCoupon} data-testid="coupon-apply-btn">{t("bf_apply")}</button>
            </div>

            <button
              type="button"
              data-testid="birth-continue-btn"
              className="btn-primary"
              disabled={busy}
              onClick={createOrder}
            >
              {busy ? <Loader2 className="animate-spin" size={16} /> : null}
              {t("bf_continue")}
            </button>
          </div>
        )}

        {step === 2 && order && (
          <div className="fade-up card-editorial">
            <div className="eyebrow mb-2">{t("bf_checkout_eyebrow")}</div>
            <h3 className="font-display text-3xl" style={{ color: "var(--obsidian)" }}>{t("bf_confirm")}</h3>
            <p className="mt-4 text-sm" style={{ color: "var(--charcoal)" }}>
              {t("bf_mock_note")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><div className="eyebrow mb-1">{t("bf_order_id")}</div><div>{order.razorpay_order_id}</div></div>
              <div><div className="eyebrow mb-1">{t("bf_amount")}</div><div>₹{order.amount}</div></div>
            </div>
            <button data-testid="pay-btn" onClick={mockPay} className="btn-primary mt-8" disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" size={16} /> {t("bf_processing")}</> : `${t("bf_pay")} ₹${order.amount}`}
            </button>
          </div>
        )}

        {step === 3 && order && (
          <div className="fade-up text-center py-8">
            <div className="inline-flex w-16 h-16 items-center justify-center rounded-full mb-6" style={{ background: "var(--espresso)" }}>
              <Check size={26} color="#F9F8F3" />
            </div>
            <h3 className="font-display text-4xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              {t("bf_ready_title")}
            </h3>
            <p className="mt-4 max-w-md mx-auto text-sm" style={{ color: "var(--charcoal)" }}>
              {t("bf_ready_body", { email: order.user_email })}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a data-testid="download-pdf-btn" className="btn-primary" href={`${api.defaults.baseURL}/orders/${order.id}/pdf`} target="_blank" rel="noreferrer">
                {t("bf_download")}
              </a>
              <button data-testid="go-dashboard-btn" className="btn-secondary" onClick={() => nav("/dashboard")}>
                {t("bf_goto_dashboard")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-2">{label}</span>
      {children}
    </label>
  );
}
