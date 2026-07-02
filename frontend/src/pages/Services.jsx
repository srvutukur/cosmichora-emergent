import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { FileText, MessageCircle, Calendar, Sparkles } from "lucide-react";

export default function Services() {
  const { t } = useI18n();
  const services = [
    { icon: FileText, k: 1, link: "/reports" },
    { icon: MessageCircle, k: 2, link: "/appointment" },
    { icon: Calendar, k: 3, link: "/reports" },
    { icon: Sparkles, k: 4, link: "/reports/custom-report" },
  ];

  return (
    <div data-testid="services-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">{t("services_eyebrow")}</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          {t("services_title")}
        </h1>
      </div>
      <div className="mt-16 grid md:grid-cols-2 gap-6">
        {services.map((s) => (
          <Link key={s.k} to={s.link} data-testid={`service-${s.k}`} className="card-editorial">
            <s.icon size={22} style={{ color: "var(--brass)" }} />
            <h3 className="font-display text-3xl mt-6" style={{ color: "var(--obsidian)" }}>{t(`svc_${s.k}_t`)}</h3>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--charcoal)" }}>{t(`svc_${s.k}_d`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
