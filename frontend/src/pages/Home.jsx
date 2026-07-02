import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useI18n } from "../lib/i18n";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1714636608872-048fc9231892?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGJlaWdlJTIwY29zbWljJTIwdGV4dHVyZXxlbnwwfHx8fDE3ODI5Njg2OTN8MA&ixlib=rb-4.1.0&q=85";
const CELESTIAL = "https://images.unsplash.com/photo-1765205674367-74db717a6d5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwYXN0cm9ub215JTIwY2VsZXN0aWFsfGVufDB8fHx8MTc4Mjk2ODY5M3ww&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const { t, tReport } = useI18n();
  const [reports, setReports] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get("/report-types").then((r) => setReports(r.data.slice(0, 6))).catch(() => {});
    api.get("/testimonials").then((r) => setTestimonials(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: "var(--bone)" }}>
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="constellation absolute inset-0 opacity-40 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-24 md:pt-32 pb-24 md:pb-32 grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-7 fade-up">
            <div className="eyebrow mb-8">{t("hero_eyebrow")}</div>
            <h1 className="font-display font-light tracking-tighter text-5xl md:text-7xl leading-[0.95]" style={{ color: "var(--obsidian)" }}>
              {t("hero_line1")}<br />
              <span style={{ color: "var(--espresso)" }}>{t("hero_line2")}</span> <em style={{ color: "var(--brass)" }}>{t("hero_line3")}</em>.
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
            <div className="mt-12 flex items-center gap-8 text-sm" style={{ color: "var(--charcoal)" }}>
              <div className="flex items-center gap-2"><Star size={14} fill="#B89764" stroke="#B89764" /> {t("hero_stat_rating")}</div>
              <div>·</div>
              <div>{t("hero_stat_delivered")}</div>
              <div className="hidden md:block">·</div>
              <div className="hidden md:block">{t("hero_stat_types")}</div>
            </div>
          </div>

          <div className="lg:col-span-5 fade-up delay-200 relative">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--beige)" }}>
              <img src={CELESTIAL} alt="Vintage astronomy" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md p-5" style={{ background: "rgba(249,248,243,0.85)" }}>
                <div className="eyebrow mb-2">{t("hero_featured")}</div>
                <div className="font-display text-2xl" style={{ color: "var(--obsidian)" }}>{t("hero_featured_title")}</div>
                <div className="text-sm mt-1" style={{ color: "var(--charcoal)" }}>{t("hero_featured_sub")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">{t("ritual_eyebrow")}</div>
            <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              {t("ritual_title")}
            </h2>
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="fade-up">
                <div className="font-display text-5xl mb-4" style={{ color: "var(--brass)" }}>0{n}</div>
                <div className="font-display text-2xl mb-2" style={{ color: "var(--obsidian)" }}>{t(`ritual_${n}_t`)}</div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{t(`ritual_${n}_d`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED REPORTS */}
      <section className="py-24 md:py-32" style={{ background: "var(--beige)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="eyebrow mb-4">{t("library_eyebrow")}</div>
              <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
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
                  <div className="eyebrow mb-3">{r.tagline}</div>
                  <h3 className="font-display text-3xl mb-3" style={{ color: "var(--obsidian)" }}>{r.title}</h3>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--charcoal)" }}>
                    {(r.description || "").slice(0, 130)}…
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl" style={{ color: "var(--espresso)" }}>₹{r.price}</span>
                    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: "var(--brass)" }}>
                      {t("library_order")} <ArrowRight size={12} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-14">
              <div className="eyebrow mb-4">{t("tst_eyebrow")}</div>
              <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
                {t("tst_title")}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((tt) => (
                <figure key={tt.id} className="card-editorial" style={{ background: "var(--bone)" }}>
                  <div className="flex mb-4">
                    {Array.from({ length: tt.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="#B89764" stroke="#B89764" />
                    ))}
                  </div>
                  <blockquote className="font-display text-2xl leading-snug mb-6" style={{ color: "var(--obsidian)" }}>
                    “{tt.quote}”
                  </blockquote>
                  <figcaption>
                    <div className="text-sm font-medium" style={{ color: "var(--espresso)" }}>{tt.name}</div>
                    <div className="text-xs" style={{ color: "var(--charcoal)" }}>{tt.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 md:py-32" style={{ background: "var(--espresso)", color: "var(--bone)" }}>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <Sparkles size={22} className="mx-auto mb-6" style={{ color: "var(--brass)" }} />
          <h2 className="font-display font-light text-4xl md:text-6xl tracking-tighter">{t("cta_title")}</h2>
          <p className="mt-6 text-base md:text-lg max-w-xl mx-auto" style={{ color: "rgba(249,248,243,0.75)" }}>
            {t("cta_body")}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/reports" data-testid="footer-cta-reports" className="btn-primary" style={{ background: "var(--brass)" }}>
              {t("cta_choose")} <ArrowRight size={16} />
            </Link>
            <Link to="/appointment" data-testid="footer-cta-appointment" className="btn-secondary" style={{ color: "var(--bone)", borderColor: "rgba(249,248,243,0.35)" }}>
              {t("cta_speak")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
