import React, { useState } from "react";
import api, { formatApiError } from "../lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Appointment() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", date: "", time: "", topic: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/appointments", form);
      toast.success("Requested. We will confirm your slot by email.");
      setForm({ name: "", email: "", mobile: "", date: "", time: "", topic: "" });
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="appointment-page" className="max-w-4xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="eyebrow mb-4">Schedule an Appointment</div>
      <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
        Sit with a senior astrologer.
      </h1>
      <p className="mt-6 max-w-xl" style={{ color: "var(--charcoal)" }}>
        Private, 45-minute conversations available by request. We will confirm your slot by email.
      </p>

      <form onSubmit={submit} className="mt-12 grid md:grid-cols-2 gap-8">
        <label className="block md:col-span-2">
          <span className="eyebrow block mb-2">Name</span>
          <input data-testid="appt-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Email</span>
          <input data-testid="appt-email-input" type="email" className="input-editorial" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Mobile</span>
          <input data-testid="appt-mobile-input" className="input-editorial" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Preferred Date</span>
          <input data-testid="appt-date-input" type="date" className="input-editorial" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Preferred Time</span>
          <input data-testid="appt-time-input" type="time" className="input-editorial" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required />
        </label>
        <label className="block md:col-span-2">
          <span className="eyebrow block mb-2">What would you like to discuss?</span>
          <textarea data-testid="appt-topic-input" rows={4} className="input-editorial" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        </label>
        <div className="md:col-span-2">
          <button data-testid="appt-submit-btn" type="submit" className="btn-primary" disabled={busy}>
            {busy && <Loader2 size={14} className="animate-spin" />} Request appointment
          </button>
        </div>
      </form>
    </div>
  );
}
