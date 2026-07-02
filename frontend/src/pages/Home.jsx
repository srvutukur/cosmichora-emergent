import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const HERO_BG = "https://images.unsplash.com/photo-1714636608872-048fc9231892?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGJlaWdlJTIwY29zbWljJTIwdGV4dHVyZXxlbnwwfHx8fDE3ODI5Njg2OTN8MA&ixlib=rb-4.1.0&q=85";
const CELESTIAL = "https://images.unsplash.com/photo-1765205674367-74db717a6d5e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwYXN0cm9ub215JTIwY2VsZXN0aWFsfGVufDB8fHx8MTc4Mjk2ODY5M3ww&ixlib=rb-4.1.0&q=85";

export default function Home() {
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
            <div className="eyebrow mb-8">Ancient Wisdom · Modern Craft</div>
            <h1 className="font-display font-light tracking-tighter text-5xl md:text-7xl leading-[0.95]" style={{ color: "var(--obsidian)" }}>
              The cosmos,<br />
              <span style={{ color: "var(--espresso)" }}>translated</span> <em style={{ color: "var(--brass)" }}>for you</em>.
            </h1>
            <p className="mt-8 text-base md:text-lg max-w-xl leading-relaxed" style={{ color: "var(--charcoal)" }}>
              AI-crafted Vedic astrology reports, prepared with the care of a seasoned scholar and delivered to your inbox within minutes. No queues. No noise. Just the sky, whispering.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/reports" data-testid="hero-cta-reports" className="btn-primary">
                Explore Reports <ArrowRight size={16} />
              </Link>
              <Link to="/services" data-testid="hero-cta-services" className="btn-secondary">
                How it works
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-8 text-sm" style={{ color: "var(--charcoal)" }}>
              <div className="flex items-center gap-2"><Star size={14} fill="#B89764" stroke="#B89764" /> 4.9 rating</div>
              <div>·</div>
              <div>12,000+ readings delivered</div>
              <div className="hidden md:block">·</div>
              <div className="hidden md:block">15 report types</div>
            </div>
          </div>

          <div className="lg:col-span-5 fade-up delay-200 relative">
            <div className="relative aspect-[4/5] overflow-hidden" style={{ background: "var(--beige)" }}>
              <img src={CELESTIAL} alt="Vintage astronomy" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md p-5" style={{ background: "rgba(249,248,243,0.85)" }}>
                <div className="eyebrow mb-2">Featured Report</div>
                <div className="font-display text-2xl" style={{ color: "var(--obsidian)" }}>Complete Horoscope</div>
                <div className="text-sm mt-1" style={{ color: "var(--charcoal)" }}>A definitive lifetime reading in the sidereal tradition.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="eyebrow mb-4">The Ritual</div>
            <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
              Four gentle steps between you and the stars.
            </h2>
          </div>
          <div className="mt-16 grid md:grid-cols-4 gap-8">
            {[
              { n: "01", t: "Choose a report", d: "From Complete Horoscope to Muhurta — 15 traditions await." },
              { n: "02", t: "Share your birth details", d: "Name, date, time and place. Handled with reverence." },
              { n: "03", t: "Complete payment", d: "Encrypted checkout, receipt sent instantly." },
              { n: "04", t: "Receive your PDF", d: "Delivered to your inbox and dashboard within minutes." },
            ].map((s) => (
              <div key={s.n} className="fade-up">
                <div className="font-display text-5xl mb-4" style={{ color: "var(--brass)" }}>{s.n}</div>
                <div className="font-display text-2xl mb-2" style={{ color: "var(--obsidian)" }}>{s.t}</div>
                <div className="text-sm leading-relaxed" style={{ color: "var(--charcoal)" }}>{s.d}</div>
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
              <div className="eyebrow mb-4">Our Library</div>
              <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
                Reports, meticulously composed.
              </h2>
            </div>
            <Link to="/reports" data-testid="all-reports-link" className="btn-secondary self-start md:self-auto mt-6 md:mt-0">
              View all reports <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((r) => (
              <Link
                key={r.id}
                to={`/reports/${r.slug}`}
                data-testid={`home-report-${r.slug}`}
                className="card-editorial group block"
              >
                <div className="eyebrow mb-3">{r.tagline || "Vedic Report"}</div>
                <h3 className="font-display text-3xl mb-3" style={{ color: "var(--obsidian)" }}>{r.title}</h3>
                <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--charcoal)" }}>
                  {r.description?.slice(0, 130)}…
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-xl" style={{ color: "var(--espresso)" }}>₹{r.price}</span>
                  <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest" style={{ color: "var(--brass)" }}>
                    Order <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="max-w-2xl mb-14">
              <div className="eyebrow mb-4">What Seekers Say</div>
              <h2 className="font-display font-light text-4xl md:text-5xl tracking-tight" style={{ color: "var(--obsidian)" }}>
                In their own words.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 3).map((t) => (
                <figure key={t.id} className="card-editorial" style={{ background: "var(--bone)" }}>
                  <div className="flex mb-4">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <Star key={i} size={14} fill="#B89764" stroke="#B89764" />
                    ))}
                  </div>
                  <blockquote className="font-display text-2xl leading-snug mb-6" style={{ color: "var(--obsidian)" }}>
                    “{t.quote}”
                  </blockquote>
                  <figcaption>
                    <div className="text-sm font-medium" style={{ color: "var(--espresso)" }}>{t.name}</div>
                    <div className="text-xs" style={{ color: "var(--charcoal)" }}>{t.role}</div>
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
          <h2 className="font-display font-light text-4xl md:text-6xl tracking-tighter">
            Your chart awaits.
          </h2>
          <p className="mt-6 text-base md:text-lg max-w-xl mx-auto" style={{ color: "rgba(249,248,243,0.75)" }}>
            Begin with a single reading — no subscription, no strings.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/reports" data-testid="footer-cta-reports" className="btn-primary" style={{ background: "var(--brass)" }}>
              Choose your report <ArrowRight size={16} />
            </Link>
            <Link to="/appointment" data-testid="footer-cta-appointment" className="btn-secondary" style={{ color: "var(--bone)", borderColor: "rgba(249,248,243,0.35)" }}>
              Speak with an astrologer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
