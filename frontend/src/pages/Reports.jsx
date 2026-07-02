import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import { ArrowRight, Search } from "lucide-react";

export default function Reports() {
  const { t, tReport } = useI18n();
  const [reports, setReports] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { api.get("/report-types").then((r) => setReports(r.data)); }, []);
  const filtered = reports
    .map(tReport)
    .filter((r) => (r.title + (r.description || "")).toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="reports-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">{t("library_eyebrow")}</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          {t("reports_title")}
        </h1>
        <p className="mt-6 text-base md:text-lg" style={{ color: "var(--charcoal)" }}>
          {t("reports_sub")}
        </p>
      </div>

      <div className="mt-12 flex items-center gap-3 max-w-md">
        <Search size={16} style={{ color: "var(--charcoal)" }} />
        <input
          data-testid="reports-search-input"
          type="text"
          className="input-editorial"
          placeholder={t("reports_search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <Link
            key={r.id}
            to={`/reports/${r.slug}`}
            data-testid={`report-card-${r.slug}`}
            className="card-editorial group"
          >
            <div className="eyebrow mb-3">{r.tagline || "Vedic Report"}</div>
            <h3 className="font-display text-3xl mb-3" style={{ color: "var(--obsidian)" }}>{r.title}</h3>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--charcoal)" }}>
              {r.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-display text-xl" style={{ color: "var(--espresso)" }}>
                {r.price > 0 ? `₹${r.price}` : t("free")}
              </span>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: "var(--brass)" }}>
                {t("library_order")} <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
