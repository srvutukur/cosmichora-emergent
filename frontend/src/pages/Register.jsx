import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { formatApiError } from "../lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await register(form);
      toast.success(`Welcome, ${u.name}`);
      nav("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="register-page" className="max-w-md mx-auto px-6 py-24 md:py-32">
      <div className="eyebrow mb-4">Begin your journey</div>
      <h1 className="font-display font-light text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
        Create your account.
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--charcoal)" }}>Store your reports, revisit them anytime.</p>

      <form onSubmit={submit} className="mt-12 space-y-8">
        <label className="block">
          <span className="eyebrow block mb-2">Full Name</span>
          <input data-testid="register-name-input" className="input-editorial" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Email</span>
          <input data-testid="register-email-input" className="input-editorial" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Mobile Number</span>
          <input data-testid="register-mobile-input" className="input-editorial" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">Password</span>
          <input data-testid="register-password-input" className="input-editorial" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </label>
        <button type="submit" data-testid="register-submit-btn" className="btn-primary w-full justify-center" disabled={busy}>
          {busy && <Loader2 size={14} className="animate-spin" />} Create account
        </button>
      </form>

      <p className="mt-8 text-sm" style={{ color: "var(--charcoal)" }}>
        Already have an account? <Link to="/login" className="underline">Sign in</Link>
      </p>
    </div>
  );
}
