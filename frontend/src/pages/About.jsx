import React from "react";
import { Link } from "react-router-dom";

const PORTRAIT = "https://images.unsplash.com/photo-1777887050296-829020618bf3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHx2aW50YWdlJTIwYXN0cm9ub215JTIwY2VsZXN0aWFsfGVufDB8fHx8MTc4Mjk2ODY5M3ww&ixlib=rb-4.1.0&q=85";

export default function About() {
  return (
    <div data-testid="about-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 grid lg:grid-cols-12 gap-14 items-center">
        <div className="lg:col-span-6">
          <div className="eyebrow mb-6">Our Story</div>
          <h1 className="font-display font-light text-5xl md:text-6xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
            Ancient light,<br /> patiently studied.
          </h1>
          <p className="mt-8 text-base md:text-lg leading-relaxed" style={{ color: "var(--charcoal)" }}>
            Cosmic Hora is a small studio devoted to the craft of Vedic astrology. We
            combine the classical texts — Parashara, Jaimini, Brihat Parashara Hora
            Shastra — with modern computational astronomy and language models
            fine-tuned on decades of interpretive literature.
          </p>
          <p className="mt-4 text-base md:text-lg leading-relaxed" style={{ color: "var(--charcoal)" }}>
            The result: reports that read like they were written by a thoughtful
            astrologer sitting across a wooden table, not a robot.
          </p>
        </div>
        <div className="lg:col-span-6">
          <img src={PORTRAIT} alt="Instrument" className="w-full aspect-[4/5] object-cover" />
        </div>
      </section>

      <section className="py-24" style={{ background: "var(--beige)" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="eyebrow mb-4">Our Principles</div>
          <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight mb-12" style={{ color: "var(--obsidian)" }}>Guiding stars.</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { t: "Fidelity to tradition", d: "We use the sidereal zodiac and classical dashas. No shortcuts, no hybrids." },
              { t: "Respect for privacy", d: "Your birth details are encrypted at rest and never shared with any third party." },
              { t: "Beautiful writing", d: "Every paragraph is composed to be read, considered and kept." },
            ].map((p) => (
              <div key={p.t}>
                <h3 className="font-display text-2xl mb-3" style={{ color: "var(--obsidian)" }}>{p.t}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
            Begin your reading.
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/reports" className="btn-primary">Choose a report</Link>
            <Link to="/appointment" className="btn-secondary">Book an astrologer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
