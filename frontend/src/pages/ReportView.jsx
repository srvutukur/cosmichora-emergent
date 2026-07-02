import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useI18n } from "../lib/i18n";
import ZodiacWheel from "../components/ZodiacWheel";
import { Download, ArrowLeft, Sparkles, Sun, Moon, Star, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";

/**
 * ReportView — beautifully styled in-browser display of a generated Vedic report.
 * Route: /reports/view/:orderId  (protected)
 *
 * Loads the order (which contains `report_text` HTML from the backend), renders it
 * with the mystical theme, and offers a one-click PDF download of the same content.
 */
export default function ReportView() {
  const { orderId } = useParams();
  const { t } = useI18n();
  const nav = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${orderId}`)
      .then((r) => setOrder(r.data))
      .catch((e) => setError(formatApiError(e)));
  }, [orderId]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-40 text-center">
        <h1 className="font-display text-3xl mb-4" style={{ color: "var(--obsidian)" }}>
          {error}
        </h1>
        <Link to="/dashboard" className="btn-secondary">← {t("bf_goto_dashboard")}</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-40 text-center">
        <div className="inline-flex items-center gap-3" style={{ color: "var(--charcoal)" }}>
          <div className="rotate-slow"><ZodiacWheel size={80} spinning={false} /></div>
          <span className="font-display text-2xl">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (order.status !== "completed") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-40 text-center">
        <h1 className="font-display text-3xl mb-4" style={{ color: "var(--obsidian)" }}>
          {t("rv_pending_title")}
        </h1>
        <p className="mb-8" style={{ color: "var(--charcoal)" }}>{t("rv_pending_body")}</p>
        <Link to="/dashboard" className="btn-primary">{t("bf_goto_dashboard")}</Link>
      </div>
    );
  }

  const bd = order.birth_details || {};
  const pdfUrl = `${api.defaults.baseURL}/orders/${order.id}/pdf`;

  const downloadPdf = () => {
    // Force browser download via anchor (works within our JWT cookie session)
    window.open(pdfUrl, "_blank");
    toast.success(t("rv_downloading"));
  };

  return (
    <div data-testid="report-view-page" className="relative">
      {/* Ambient cosmic backdrop */}
      <div className="mandala-bg" style={{ opacity: 0.15 }} />
      <div className="constellation absolute inset-0 opacity-40 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 md:px-12 py-16 md:py-24" style={{ zIndex: 2 }}>
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <button
            data-testid="rv-back"
            onClick={() => nav("/dashboard")}
            className="inline-flex items-center gap-2 text-sm"
            style={{ color: "var(--charcoal)" }}
          >
            <ArrowLeft size={14} /> {t("bf_goto_dashboard")}
          </button>
          <button data-testid="rv-download-pdf" onClick={downloadPdf} className="btn-primary">
            <Download size={14} /> {t("rv_download_pdf")}
          </button>
        </div>

        {/* Cover */}
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-3 mb-6">
            <Moon size={16} style={{ color: "var(--brass)" }} />
            <span className="eyebrow">{t("rv_your_report")}</span>
            <Sun size={16} style={{ color: "var(--sage, #FF9933)" }} />
          </div>
          <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.05]" style={{ color: "var(--obsidian)" }}>
            {order.report_title}
          </h1>
          <p className="mt-6 font-hand text-2xl" style={{ color: "var(--gold-warm, #E6C87A)" }}>
            {t("rv_prepared_for", { name: bd.name || "Seeker" })}
          </p>

          <div className="mt-10 flex justify-center">
            <div className="opacity-70">
              <ZodiacWheel size={280} />
            </div>
          </div>
        </div>

        {/* Birth details card */}
        <div className="card-editorial mb-16 fade-up delay-100" style={{ borderRadius: 24 }}>
          <div className="eyebrow mb-6 flex items-center gap-2">
            <Sparkles size={12} style={{ color: "var(--brass)" }} /> {t("rv_birth_details")}
          </div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            <DetailRow icon={User} label={t("bf_name")} value={bd.name} />
            <DetailRow icon={Star} label={t("bf_gender")} value={bd.gender} capitalize />
            <DetailRow icon={Clock} label={t("bf_dob")} value={bd.date} />
            <DetailRow icon={Clock} label={t("bf_tob")} value={bd.time} />
            <DetailRow icon={MapPin} label={t("bf_pob")} value={bd.place} />
            <DetailRow icon={Sparkles} label={t("rv_generated")} value={fmtDate(order.report_generated_at)} />
          </div>
        </div>

        {/* Report body */}
        <article className="card-editorial fade-up delay-200" style={{ borderRadius: 24, padding: "3rem 2.5rem" }}>
          <div className="eyebrow mb-6 text-center">{t("rv_reading")}</div>
          <div
            className="report-body font-display"
            style={{
              color: "var(--obsidian)",
              fontSize: "1.05rem",
              lineHeight: 1.85,
              letterSpacing: "0.005em",
            }}
            dangerouslySetInnerHTML={{ __html: order.report_text || "" }}
          />
          <div className="mt-12 pt-8 text-center" style={{ borderTop: "1px solid var(--hairline)" }}>
            <div className="font-hand text-2xl mb-2" style={{ color: "var(--gold-warm, #E6C87A)" }}>
              — Cosmic Hora
            </div>
            <div className="text-xs" style={{ color: "var(--charcoal)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              Order #{order.id.slice(-6)} · {fmtDate(order.created_at)}
            </div>
          </div>
        </article>

        {/* Footer actions */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <button data-testid="rv-download-pdf-2" onClick={downloadPdf} className="btn-primary">
            <Download size={14} /> {t("rv_download_pdf")}
          </button>
          <Link to="/reports" className="btn-secondary">{t("dash_order_another")}</Link>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5"
           style={{ background: "rgba(212,175,55,0.10)", border: "1px solid var(--hairline)" }}>
        <Icon size={14} style={{ color: "var(--brass)" }} />
      </div>
      <div>
        <div className="eyebrow mb-1">{label}</div>
        <div className="font-display text-lg" style={{
          color: "var(--obsidian)",
          textTransform: capitalize ? "capitalize" : "none",
        }}>{value || "—"}</div>
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch { return iso; }
}
