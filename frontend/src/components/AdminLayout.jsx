import React, { useState } from "react";
import { Link, Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  LayoutDashboard, Users, ShoppingBag, FileText, Ticket, BookOpen,
  MessageSquare, HelpCircle, Mail, Calendar, Settings, LogOut, Moon,
} from "lucide-react";

const LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/report-types", label: "Report Types", icon: FileText },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/blogs", label: "Blog", icon: BookOpen },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquare },
  { to: "/admin/faqs", label: "FAQ", icon: HelpCircle },
  { to: "/admin/contacts", label: "Contact Forms", icon: Mail },
  { to: "/admin/appointments", label: "Appointments", icon: Calendar },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--espresso)", border: "1px solid var(--hairline)", borderRadius: 20 }}>
      <aside
        data-testid="admin-sidebar"
        className={`${open ? "block" : "hidden"} lg:block w-72 shrink-0 fixed lg:static inset-y-0 left-0 z-40`}
        style={{ background: "var(--beige)", borderRight: "1px solid var(--hairline-soft)" }}
      >
        <div className="p-6" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex w-9 h-9 items-center justify-center rounded-full" style={{ background: "var(--espresso)" }}>
              <Moon size={16} color="#F5E9D3" />
            </span>
            <span className="font-display text-xl" style={{ color: "var(--obsidian)" }}>Cosmic Hora</span>
          </Link>
          <div className="eyebrow mt-4">Admin Console</div>
        </div>
        <nav className="p-4 space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              data-testid={`admin-nav-${l.label.toLowerCase().replace(/\s/g, "-")}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-colors ${
                  isActive ? "bg-white" : "hover:bg-white/60"
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? "var(--obsidian)" : "var(--charcoal)",
                borderLeft: isActive ? "2px solid var(--brass)" : "2px solid transparent",
              })}
            >
              <l.icon size={16} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 mt-4" style={{ borderTop: "1px solid var(--hairline-soft)" }}>
          <div className="text-sm mb-2" style={{ color: "var(--charcoal)" }}>{user?.name}</div>
          <div className="text-xs mb-3" style={{ color: "var(--charcoal)" }}>{user?.email}</div>
          <button
            data-testid="admin-logout"
            onClick={async () => { await logout(); nav("/"); }}
            className="btn-secondary w-full justify-center"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="lg:hidden p-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--hairline-soft)" }}>
          <button data-testid="admin-menu-toggle" onClick={() => setOpen(!open)} className="btn-secondary">Menu</button>
          <span className="font-display text-lg">Admin</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
