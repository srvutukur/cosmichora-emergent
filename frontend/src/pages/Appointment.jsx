import React, { useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Appointment() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", date: "", time: "", topic: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/appointments", form);
      toast.success(t("appt_thanks"));
      setForm({ name: "", email: "", mobile: "", date: "", time: "", topic: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="appointment-page" className="max-w-4xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="eyebrow mb-4">{t("appt_eyebrow")}</div>
      <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
        {t("appt_title")}
      </h1>
      <p className="mt-6 max-w-xl" style={{ color: "var(--charcoal)" }}>{t("appt_sub")}</p>

      <form onSubmit={submit} className="mt-12 grid md:grid-cols-2 gap-8">
        <label className="block md:col-span-2">
          <span className="eyebrow block mb-2">{t("field_name")}</span>
          <input data-testid="appt-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("field_email")}</span>
          <input data-testid="appt-email-input" type="email" className="input-editorial" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("appt_mobile")}</span>
          <input data-testid="appt-mobile-input" className="input-editorial" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("appt_date")}</span>
          <input data-testid="appt-date-input" type="date" className="input-editorial" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("appt_time")}</span>
          <input data-testid="appt-time-input" type="time" className="input-editorial" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow block mb-2">{t("appt_topic")}</span>
          <textarea data-testid="appt-topic-input" rows={4} className="input-editorial" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </label>
        <div className="md:col-span-2">
          <button data-testid="appt-submit-btn" type="submit" className="btn-primary" disabled={busy}>
            {busy && <Loader2 size={14} className="animate-spin" />} {t("appt_submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
