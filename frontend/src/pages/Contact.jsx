import React, { useState } from "react";
import api, { formatApiError } from "../lib/api";
import { useI18n } from "../lib/i18n";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/contact", form);
      toast.success(t("contact_thanks"));
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="contact-page" className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28 grid lg:grid-cols-2 gap-16">
      <div>
        <div className="eyebrow mb-4">{t("contact_eyebrow")}</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          {t("contact_title")}
        </h1>
        <p className="mt-6" style={{ color: "var(--charcoal)" }}>{t("contact_sub")}</p>
        <div className="mt-10 space-y-3 text-sm" style={{ color: "var(--charcoal)" }}>
          <div><span className="eyebrow block">{t("contact_email_lbl")}</span>hello@cosmichora.com</div>
          <div><span className="eyebrow block mt-3">{t("contact_phone_lbl")}</span>+91 90000 00000</div>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-8">
        <label className="block">
          <span className="eyebrow block mb-2">{t("field_name")}</span>
          <input data-testid="contact-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("field_email")}</span>
          <input data-testid="contact-email-input" type="email" className="input-editorial" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("contact_subject")}</span>
          <input data-testid="contact-subject-input" className="input-editorial" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("contact_message")}</span>
          <textarea data-testid="contact-message-input" rows={5} className="input-editorial" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
        </label>
        <button data-testid="contact-submit-btn" type="submit" className="btn-primary" disabled={busy}>
          {busy && <Loader2 size={14} className="animate-spin" />} {t("contact_send")}
        </button>
      </form>
    </div>
  );
}
