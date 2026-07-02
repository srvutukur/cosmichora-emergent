import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";

const PORTRAIT = "https://images.unsplash.com/photo-1777887050296-829020618bf3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHx2aW50YWdlJTIwYXN0cm9ub215JTIwY2VsZXN0aWFsfGVufDB8fHx8MTc4Mjk2ODY5M3ww&ixlib=rb-4.1.0&q=85";

export default function About() {
  const { t } = useI18n();
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-6">
          <div className="eyebrow mb-6">{t("about_eyebrow")}</div>
          <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
            {t("about_title_1")}<br /> {t("about_title_2")}
          </h1>
          <p className="mt-8 text-base md:text-lg leading-relaxed" style={{ color: "var(--charcoal)" }}>{t("about_p1")}</p>
          <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: "var(--charcoal)" }}>{t("about_p2")}</p>
        </div>
        <div className="lg:col-span-6">
          <img src={PORTRAIT} alt="Instrument" className="w-full aspect-[4/5] object-cover" />
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--beige)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="eyebrow mb-4">{t("about_principles")}</div>
          <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight mb-12" style={{ color: "var(--obsidian)" }}>{t("about_principles_title")}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[1, 2, 3].map((n) => (
              <div key={n}>
                <h3 className="font-display text-2xl mb-3" style={{ color: "var(--obsidian)" }}>{t(`about_pr${n}_t`)}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{t(`about_pr${n}_d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>{t("about_begin")}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/reports" className="btn-primary">{t("about_choose_report")}</Link>
            <Link to="/appointment" className="btn-secondary">{t("about_book")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
