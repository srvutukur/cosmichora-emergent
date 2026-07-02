import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Menu, X, Moon } from "lucide-react";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/reports", label: "Reports" },
  { to: "/services", label: "Services" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Journal" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bone)" }}>
      <header
        data-testid="site-header"
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{ background: "rgba(249,248,243,0.85)", borderBottom: "1px solid rgba(58,48,42,0.08)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <Link to="/" data-testid="brand-logo" className="flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-full" style={{ background: "var(--espresso)" }}>
              <Moon size={16} color="#F9F8F3" />
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
                data-testid={`nav-${n.label.toLowerCase()}`}
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

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} data-testid="nav-dashboard" className="btn-secondary">
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
                <button data-testid="nav-logout" onClick={async () => { await logout(); nav("/"); }} className="btn-primary">
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" data-testid="nav-login" className="btn-secondary">Sign in</Link>
                <Link to="/register" data-testid="nav-register" className="btn-primary">Begin</Link>
              </>
            )}
          </div>

          <button className="lg:hidden" data-testid="mobile-menu-toggle" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden px-6 pb-6 space-y-4" style={{ borderTop: "1px solid rgba(58,48,42,0.08)" }}>
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-2 text-sm" style={{ color: "var(--charcoal)" }}>
                {n.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="btn-secondary w-full justify-center">
                  {user.role === "admin" ? "Admin" : "Dashboard"}
                </Link>
                <button onClick={async () => { await logout(); nav("/"); setOpen(false); }} className="btn-primary w-full justify-center">
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center">Begin</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer data-testid="site-footer" style={{ background: "var(--beige)", borderTop: "1px solid rgba(58,48,42,0.08)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="font-display text-2xl mb-3" style={{ color: "var(--obsidian)" }}>Cosmic Hora</div>
            <p className="text-sm" style={{ color: "var(--charcoal)" }}>
              Ancient Vedic wisdom, crafted anew for the modern seeker.
            </p>
          </div>
          <div>
            <div className="eyebrow mb-4">Explore</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/reports">Reports</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/appointment">Book an astrologer</Link></li>
              <li><Link to="/blog">Journal</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Company</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <div className="eyebrow mb-4">Legal</div>
            <ul className="space-y-2 text-sm" style={{ color: "var(--charcoal)" }}>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 text-xs flex flex-col md:flex-row justify-between gap-2"
             style={{ color: "var(--charcoal)", borderTop: "1px solid rgba(58,48,42,0.08)" }}>
          <span>© {new Date().getFullYear()} Cosmic Hora. All rights reserved.</span>
          <span>Made with reverence for the sky.</span>
        </div>
      </footer>
    </div>
  );
}
