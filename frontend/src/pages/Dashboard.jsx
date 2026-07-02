import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import api from "../lib/api";
import { Download, Clock, Check } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/mine").then((r) => setOrders(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="dashboard-page" className="max-w-6xl mx-auto px-6 md:px-12 py-20">
      <div className="eyebrow mb-4">Your Sanctuary</div>
      <h1 className="font-display font-light text-5xl tracking-tighter" style={{ color: "var(--obsidian)" }}>
        Welcome, {user?.name?.split(" ")[0]}.
      </h1>
      <p className="mt-3" style={{ color: "var(--charcoal)" }}>{user?.email}</p>

      <div className="mt-14">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-3xl" style={{ color: "var(--obsidian)" }}>Your reports</h2>
          <Link to="/reports" className="btn-secondary">Order another</Link>
        </div>

        {loading && <div className="text-sm" style={{ color: "var(--charcoal)" }}>Loading…</div>}
        {!loading && orders.length === 0 && (
          <div className="card-editorial text-center py-16">
            <div className="font-display text-3xl mb-3" style={{ color: "var(--obsidian)" }}>Your library is empty</div>
            <p className="text-sm mb-6" style={{ color: "var(--charcoal)" }}>Begin with any of our 15 report types.</p>
            <Link to="/reports" data-testid="dashboard-empty-cta" className="btn-primary">Browse reports</Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o.id}
              data-testid={`order-row-${o.id}`}
              className="card-editorial flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <div className="eyebrow mb-1">{o.status}</div>
                <div className="font-display text-2xl" style={{ color: "var(--obsidian)" }}>{o.report_title}</div>
                <div className="text-xs mt-2" style={{ color: "var(--charcoal)" }}>
                  Order #{o.id.slice(-6)} · ₹{o.amount} · {new Date(o.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {o.status === "completed" ? (
                  <a
                    data-testid={`download-${o.id}`}
                    href={`${api.defaults.baseURL}/orders/${o.id}/pdf`}
                    target="_blank" rel="noreferrer"
                    className="btn-primary"
                  >
                    <Download size={14} /> PDF
                  </a>
                ) : o.status === "pending" ? (
                  <span className="btn-secondary" style={{ cursor: "default" }}>
                    <Clock size={14} /> Payment pending
                  </span>
                ) : (
                  <span className="btn-secondary" style={{ cursor: "default" }}>
                    <Check size={14} /> {o.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
