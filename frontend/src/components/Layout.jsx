import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { Menu, X, Moon, Globe, Check } from "lucide-react";

function LangSwitch({ mobile = false, langs, lang, setLang, open, setOpen }) {
  const current = langs.find((l) => l.code === lang) || langs[0];
  return (
    <div className="relative">
      <button
        data-testid="lang-switch-btn"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 text-sm tracking-wide"
        style={{ color: "var(--charcoal)" }}
      >
        <Globe size={14} /> {current.short}
      </button>
      {open && (
        <div
          className={`absolute ${mobile ? "left-0" : "right-0"} mt-3 min-w-[160px] py-2 z-50`}
          style={{ background: "var(--bone)", border: "1px solid var(--hairline)" }}
        >
          {langs.map((l) => (
            <button
              key={l.code}
              data-testid={`lang-option-${l.code}`}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-black/5"
              style={{ color: "var(--obsidian)" }}
            >
              <span>{l.label}</span>
              {lang === l.code && <Check size={12} style={{ color: "var(--brass)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, langs } = useI18n();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const NAV = [
    { to: "/", label: t("nav_home") },
    { to: "/reports", label: t("nav_reports") },
    { to: "/about", label: t("nav_about") },
    { to: "/contact", label: t("nav_contact") },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--espresso)", border: "1px solid var(--hairline)", borderRadius: 20 }}>
      <header
        data-testid="site-header"
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: "rgba(14,11,36,0.75)", borderBottom: "1px solid var(--hairline-soft)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <Link to="/" data-testid="brand-logo" className="flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-full" style={{ background: "var(--espresso)" }}>
              <Moon size={16} color="#F5E9D3" />
            </span>
            <span className="font-display text-2xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              Cosmic Hora
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.to.replace("/", "") || "home"}`}
                className="text-sm tracking-wide transition-colors"
                style={{
                  color: loc.pathname === n.to ? "var(--espresso)" : "var(--charcoal)",
                  borderBottom: loc.pathname === n.to ? "1px solid var(--brass)" : "1px solid transparent",
                  paddingBottom: "2px",
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <LangSwitch langs={langs} lang={lang} setLang={setLang} open={langOpen} setOpen={setLangOpen} />
            {user && (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} data-testid="nav-dashboard" className="btn-secondary">
                  {user.role === "admin" ? t("nav_admin") : t("nav_dashboard")}
                </Link>
                <button data-testid="nav-logout" onClick={async () => { await logout(); nav("/"); }} className="btn-primary">
                  {t("nav_signout")}
                </button>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            <LangSwitch mobile langs={langs} lang={lang} setLang={setLang} open={langOpen} setOpen={setLangOpen} />
            <button data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden px-6 pb-6 space-y-4" style={{ borderTop: "1px solid var(--hairline-soft)" }}>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-sm" style={{ color: "var(--charcoal)" }}>
                {n.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">
                  {user.role === "admin" ? t("nav_admin") : t("nav_dashboard")}
                </Link>
                <button onClick={async () => { await logout(); nav("/"); setOpen(false); }} className="btn-primary w-full justify-center">
                  {t("nav_signout")}
                </button>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer data-testid="site-footer" style={{ background: "var(--beige)", borderTop: "1px solid var(--hairline-soft)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-2xl mb-3" style={{ color: "var(--obsidian)" }}>Cosmic Hora</div>
            <p className="text-sm" style={{ color: "var(--charcoal)" }}>{t("footer_tagline")}</p>
          </div>
          <div>
            <div className="eyebrow mb-4">{t("footer_explore")}</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/reports">{t("nav_reports")}</Link></li>
              <li><Link to="/pricing">{t("nav_pricing")}</Link></li>
              <li><Link to="/appointment">{t("footer_book")}</Link></li>
              <li><Link to="/blog">{t("nav_journal")}</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">{t("footer_company")}</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/about">{t("nav_about")}</Link></li>
              <li><Link to="/services">{t("nav_services")}</Link></li>
              <li><Link to="/contact">{t("nav_contact")}</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">{t("footer_legal")}</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 text-xs flex flex-col md:flex-row justify-between gap-2"
             style={{ color: "var(--charcoal)", borderTop: "1px solid var(--hairline-soft)" }}>
          <span>© {new Date().getFullYear()} Cosmic Hora. {t("footer_rights")}</span>
          <span>{t("footer_madewith")}</span>
        </div>
      </footer>
    </div>
  );
}
