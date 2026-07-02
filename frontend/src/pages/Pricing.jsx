import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { Check } from "lucide-react";

export default function Pricing() {
  const [reports, setReports] = useState([]);
  useEffect(() => { api.get("/report-types").then((r) => setReports(r.data)); }, []);

  const bundles = [
    { name: "Essential", price: 499, features: ["Monthly forecast", "PDF delivery", "Dashboard access"] },
    { name: "Insight", price: 1499, featured: true, features: ["Any single detailed report", "Priority delivery", "Life-time access", "Email + Dashboard"] },
    { name: "Complete Path", price: 4999, features: ["Complete Horoscope", "Yearly Predictions", "Career + Finance", "Priority astrologer response"] },
  ];

  return (
    <div data-testid="pricing-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">Pricing</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          Fair, transparent, timeless.
        </h1>
        <p className="mt-6 text-base" style={{ color: "var(--charcoal)" }}>
          Buy a single report or choose a bundle. No subscriptions, ever.
        </p>
      </div>

      <div className="mt-16 grid md:grid-cols-3 gap-6">
        {bundles.map((b) => (
          <div key={b.name} className={`card-editorial ${b.featured ? "" : ""}`} style={b.featured ? { background: "var(--espresso)", color: "var(--bone)" } : {}}>
            <div className="eyebrow" style={{ color: b.featured ? "var(--brass)" : "var(--charcoal)" }}>{b.name}</div>
            <div className="font-display text-5xl mt-3 mb-6" style={{ color: b.featured ? "var(--bone)" : "var(--obsidian)" }}>
              ₹{b.price}
            </div>
            <ul className="space-y-3 mb-8">
              {b.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm" style={{ color: b.featured ? "rgba(249,248,243,0.85)" : "var(--charcoal)" }}>
                  <Check size={14} style={{ color: "var(--brass)", marginTop: 3 }} /> {f}
                </li>
              ))}
            </ul>
            <Link to="/reports" data-testid={`pricing-cta-${b.name.toLowerCase()}`} className="btn-primary w-full justify-center" style={b.featured ? { background: "var(--brass)" } : {}}>
              Choose
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-20">
        <div className="eyebrow mb-4">Individual reports</div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((r) => (
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
