import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { formatApiError } from "../lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      toast.success(`Welcome back, ${u.name || u.email}`);
      nav(u.role === "admin" ? "/admin" : next);
    } catch (err) {
      toast.error(formatApiError(err));
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="login-page" className="max-w-md mx-auto px-6 py-24 md:py-32">
      <div className="eyebrow mb-4">{t("login_eyebrow")}</div>
      <h1 className="font-display font-light text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
        {t("login_title")}
      </h1>
      <p className="mt-3 text-sm" style={{ color: "var(--charcoal)" }}>{t("login_sub")}</p>

      <form onSubmit={submit} className="mt-12 space-y-8">
        <label className="block">
          <span className="eyebrow block mb-2">{t("field_email")}</span>
          <input data-testid="login-email-input" className="input-editorial" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block">
          <span className="eyebrow block mb-2">{t("field_password")}</span>
          <input data-testid="login-password-input" className="input-editorial" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" data-testid="login-submit-btn" className="btn-primary w-full justify-center" disabled={busy}>
          {busy && <Loader2 size={14} className="animate-spin" />} {t("login_submit")}
        </button>
      </form>

      <p className="mt-8 text-sm" style={{ color: "var(--charcoal)" }}>
        {t("login_new")} <Link to="/register" className="underline">{t("login_create")}</Link>
      </p>
    </div>
  );
}
