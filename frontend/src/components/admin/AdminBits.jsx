import React from "react";

export function AdminHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
      <div>
        <div className="eyebrow mb-3">{subtitle}</div>
        <h1 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
          {title}
        </h1>
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

export function AdminPage({ children }) {
  return <div className="p-6 md:p-12">{children}</div>;
}

export function Table({ columns, rows, empty = "No data yet." }) {
  return (
    <div className="border" style={{ borderColor: "rgba(58,48,42,0.1)" }}>
      <div className="grid text-xs uppercase tracking-widest px-6 py-4"
           style={{ gridTemplateColumns: columns.map((c) => c.w || "1fr").join(" "),
                    color: "var(--charcoal)",
                    background: "rgba(240,239,237,0.7)",
                    borderBottom: "1px solid rgba(58,48,42,0.1)" }}>
        {columns.map((c) => <div key={c.key}>{c.label}</div>)}
      </div>
      {rows.length === 0 ? (
        <div className="px-6 py-14 text-center text-sm" style={{ color: "var(--charcoal)" }}>{empty}</div>
      ) : (
        rows.map((r, idx) => (
          <div key={r.id || idx} className="grid px-6 py-4 items-center text-sm"
               style={{ gridTemplateColumns: columns.map((c) => c.w || "1fr").join(" "),
                        borderBottom: "1px solid rgba(58,48,42,0.06)",
                        color: "var(--obsidian)" }}>
            {columns.map((c) => <div key={c.key}>{c.render ? c.render(r) : (r[c.key] ?? "—")}</div>)}
          </div>
        ))
      )}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <div className="p-6" style={{ background: "white", border: "1px solid rgba(58,48,42,0.08)" }}>
      <div className="eyebrow mb-2">{label}</div>
      <div className="font-display text-4xl" style={{ color: "var(--obsidian)" }}>{value}</div>
      {hint && <div className="text-xs mt-2" style={{ color: "var(--charcoal)" }}>{hint}</div>}
    </div>
  );
}
