import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import { Check } from "lucide-react";

export default function Pricing() {
  const { t, tReport } = useI18n();
  const [reports, setReports] = useState([]);
  useEffect(() => { api.get("/report-types").then((r) => setReports(r.data)); }, []);

  const bundles = [
    { key: "essential", price: 499, features: ["Monthly forecast", "PDF delivery", "Dashboard access"] },
    { key: "insight", price: 1499, featured: true, features: ["Any single detailed report", "Priority delivery", "Life-time access", "Email + Dashboard"] },
    { key: "complete", price: 4999, features: ["Complete Horoscope", "Yearly Predictions", "Career + Finance", "Priority astrologer response"] },
  ];

  return (
    <div data-testid="pricing-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">{t("pricing_eyebrow")}</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          {t("pricing_title")}
        </h1>
        <p className="mt-6 text-base" style={{ color: "var(--charcoal)" }}>{t("pricing_sub")}</p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {bundles.map((b) => (
          <div key={b.key} className="card-editorial" style={b.featured ? { background: "var(--espresso)", color: "var(--bone)" } : {}}>
            <div className="eyebrow" style={{ color: b.featured ? "var(--brass)" : "var(--charcoal)" }}>{t(`pricing_${b.key}`)}</div>
            <div className="font-display text-5xl mt-3 mb-6" style={{ color: b.featured ? "var(--bone)" : "var(--obsidian)" }}>₹{b.price}</div>
            <ul className="space-y-3 mb-8">
              {b.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: b.featured ? "rgba(249,248,243,0.85)" : "var(--charcoal)" }}>
                  <Check size={14} style={{ color: "var(--brass)", marginTop: 3 }} /> {f}
                </li>
              ))}
            </ul>
            <Link to="/reports" data-testid={`pricing-cta-${b.key}`} className="btn-primary w-full justify-center" style={b.featured ? { background: "var(--brass)" } : {}}>
              {t("pricing_choose")}
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="eyebrow mb-4">{t("pricing_individual")}</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map(tReport).map((r) => (
            <Link key={r.id} to={`/reports/${r.slug}`} className="flex items-center justify-between p-5 border" style={{ borderColor: "rgba(58,48,42,0.1)" }}>
              <span style={{ color: "var(--obsidian)" }}>{r.title}</span>
              <span className="font-display text-lg" style={{ color: "var(--brass)" }}>₹{r.price}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
