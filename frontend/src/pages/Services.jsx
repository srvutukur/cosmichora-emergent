import React from "react";
import { Link } from "react-router-dom";
import { FileText, MessageCircle, Calendar, Sparkles } from "lucide-react";

export default function Services() {
  const services = [
    { icon: FileText, t: "AI Reports", d: "Instant, PDF-delivered Vedic reports across 15 traditions.", link: "/reports" },
    { icon: MessageCircle, t: "Live Consultations", d: "Book a private session with a senior astrologer (coming soon).", link: "/appointment" },
    { icon: Calendar, t: "Muhurta Selection", d: "Choose auspicious timing for weddings, launches and journeys.", link: "/reports/muhurta" },
    { icon: Sparkles, t: "Custom Analysis", d: "Ask a specific life question and receive a bespoke reading.", link: "/reports/custom-report" },
  ];

  return (
    <div data-testid="services-page" className="max-w-7xl mx-auto px-6 md:px-12 py-20 md:py-28">
      <div className="max-w-3xl">
        <div className="eyebrow mb-4">Services</div>
        <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
          Everything the sky has to say.
        </h1>
      </div>
      <div className="mt-16 grid md:grid-cols-2 gap-6">
        {services.map((s) => (
          <Link key={s.t} to={s.link} data-testid={`service-${s.t.toLowerCase().replace(/\s/g, "-")}`} className="card-editorial">
            <s.icon size={22} style={{ color: "var(--brass)" }} />
            <h3 className="font-display text-3xl mt-6" style={{ color: "var(--obsidian)" }}>{s.t}</h3>
            <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--charcoal)" }}>{s.d}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
