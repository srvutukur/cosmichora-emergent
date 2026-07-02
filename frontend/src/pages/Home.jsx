import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import ZodiacWheel from "../components/ZodiacWheel";
import { ArrowRight, Sparkles, Sun, Moon as MoonIcon } from "lucide-react";

const HERO_IMG = "/generated/hero-celestial.png";

export default function Home() {
  const { t, tReport } = useI18n();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    api.get("/report-types").then((r) => setReports(r.data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* ───────── HERO ───────── */}
      <section className="relative overflow-hidden" style={{ minHeight: "92vh" }}>
        {/* Layer 1: generated celestial photo (bottom) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.7,
          }}
        />
        {/* Layer 2: purple/indigo vignette blend */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 90% 70% at 50% 40%, rgba(14,11,36,0) 0%, rgba(14,11,36,0.55) 60%, rgba(14,11,36,0.95) 100%)",
          }}
        />
        {/* Layer 3: aurora conic gradient */}
        <div className="aurora" />
        {/* Layer 4: constellations */}
        <div className="constellation absolute inset-0 opacity-90 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-24 md:pb-32 grid lg:grid-cols-12 gap-10 items-center" style={{ zIndex: 2 }}>
          {/* Left copy */}
          <div className="lg:col-span-7 fade-up">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, var(--brass))" }} />
              <div className="eyebrow">{t("hero_eyebrow")}</div>
              <span className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--brass), transparent)" }} />
            </div>
            <h1
              className="font-display font-normal tracking-tight text-5xl md:text-7xl leading-[1.02]"
              style={{ color: "var(--obsidian)" }}
            >
              {t("hero_line1")}<br />
              <span
                style={{
                  background: "linear-gradient(135deg, #E6C87A 0%, #D4AF37 45%, #FF9933 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t("hero_line2")}
              </span>{" "}
              <em className="font-hand" style={{ color: "var(--gold-warm, #E6C87A)" }}>{t("hero_line3")}</em>.
            </h1>
            <p className="mt-8 text-base md:text-lg max-w-xl leading-relaxed" style={{ color: "var(--charcoal)" }}>
              {t("hero_body")}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/reports" data-testid="hero-cta-reports" className="btn-primary">
                {t("hero_cta_reports")} <ArrowRight size={16} />
              </Link>
              <Link to="/services" data-testid="hero-cta-services" className="btn-secondary">
                {t("hero_cta_how")}
              </Link>
            </div>
          </div>

          {/* Right: zodiac wheel */}
          <div className="lg:col-span-5 flex items-center justify-center fade-up delay-200 relative">
            <div className="relative glow-pulse">
              <ZodiacWheel size={520} />
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
             style={{ background: "linear-gradient(180deg, transparent, var(--bone))" }} />
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="mandala-bg" style={{ opacity: 0.5 }} />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">{t("ritual_eyebrow")}</div>
            <h2 className="font-display font-normal text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              {t("ritual_title")}
            </h2>
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="fade-up">
                {/* Circular number badge */}
                <div className="mb-6 relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full" style={{
                    background: "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(255,153,51,0.10))",
                    border: "1px solid var(--hairline)",
                  }} />
                  <div className="absolute inset-2 rounded-full flex items-center justify-center"
                       style={{ border: "1px solid var(--hairline-soft, rgba(212,175,55,0.12))" }}>
                    <span className="font-display text-xl" style={{ color: "var(--brass)" }}>0{n}</span>
                  </div>
                </div>
                <div className="font-display text-2xl mb-2" style={{ color: "var(--obsidian)" }}>{t(`ritual_${n}_t`)}</div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{t(`ritual_${n}_d`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FEATURED REPORTS ───────── */}
      <section className="relative py-24 md:py-32 overflow-hidden" style={{ background: "linear-gradient(180deg, transparent, rgba(27,18,53,0.35), transparent)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 relative z-10">
            <div>
              <div className="eyebrow mb-4">{t("library_eyebrow")}</div>
              <h2 className="font-display font-normal text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
                {t("library_title")}
              </h2>
            </div>
            <Link to="/reports" data-testid="all-reports-link" className="btn-secondary self-start md:self-auto mt-6 md:mt-0">
              {t("library_view_all")} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((raw) => {
              const r = tReport(raw);
              return (
                <Link key={r.id} to={`/reports/${r.slug}`} data-testid={`home-report-${r.slug}`} className="card-editorial group block">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                         style={{ background: "rgba(212,175,55,0.10)", border: "1px solid var(--hairline)" }}>
                      <Sparkles size={16} style={{ color: "var(--brass)" }} />
                    </div>
                    <span className="font-display text-lg" style={{ color: "var(--brass)" }}>₹{r.price}</span>
                  </div>
                  <div className="eyebrow mb-3">{r.tagline}</div>
                  <h3 className="font-display text-2xl mb-3" style={{ color: "var(--obsidian)" }}>{r.title}</h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--charcoal)" }}>
                    {(r.description || "").slice(0, 130)}…
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: "var(--gold-warm, #E6C87A)" }}>
                    {t("library_order")} <ArrowRight size={12} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(75,43,114,0.55), transparent 70%)",
        }} />
        <div className="constellation absolute inset-0 opacity-60 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 md:px-12 text-center" style={{ zIndex: 2 }}>
          <div className="inline-flex items-center gap-3 mb-8">
            <MoonIcon size={16} style={{ color: "var(--brass)" }} />
            <span className="eyebrow">Sacred Journey</span>
            <Sun size={16} style={{ color: "var(--sage, #FF9933)" }} />
          </div>
          <h2 className="font-display font-normal text-4xl md:text-6xl tracking-tight" style={{ color: "var(--obsidian)" }}>
            {t("cta_title")}
          </h2>
          <p className="mt-6 text-base md:text-lg max-w-xl mx-auto" style={{ color: "var(--charcoal)" }}>
            {t("cta_body")}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/reports" data-testid="footer-cta-reports" className="btn-primary">
              {t("cta_choose")} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
