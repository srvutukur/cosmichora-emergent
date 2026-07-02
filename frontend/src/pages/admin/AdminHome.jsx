import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, StatCard } from "../../components/admin/AdminBits";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";

export default function AdminHome() {
  const [a, setA] = useState(null);
  useEffect(() => { api.get("/admin/analytics").then((r) => setA(r.data)); }, []);
  if (!a) return <AdminPage><div>Loading…</div></AdminPage>;

  return (
    <AdminPage>
      <AdminHeader title="Overview" subtitle="Cosmic Hora Console" />
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <StatCard label="Users" value={a.total_users} />
        <StatCard label="Orders" value={a.total_orders} />
        <StatCard label="Paid Orders" value={a.paid_orders} />
        <StatCard label="Revenue" value={`₹${Number(a.revenue).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6" style={{ background: "rgba(27,18,53,0.55)", border: "1px solid var(--hairline-soft)" }}>
          <div className="eyebrow mb-4">Revenue · last 14 days</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={a.daily}>
              <CartesianGrid stroke="var(--hairline-soft)" vertical={false} />
              <XAxis dataKey="date" fontSize={10} stroke="#B6A9CC" />
              <YAxis fontSize={10} stroke="#B6A9CC" />
              <Tooltip
                contentStyle={{ background: "#2A1B4A", color: "#F5E9D3", border: "1px solid var(--hairline)" }}
                formatter={(v) => [`₹${Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`, "Revenue"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#E6C87A" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6" style={{ background: "rgba(27,18,53,0.55)", border: "1px solid var(--hairline-soft)" }}>
          <div className="eyebrow mb-4">Orders by report type</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={a.by_type}>
              <CartesianGrid stroke="var(--hairline-soft)" vertical={false} />
              <XAxis dataKey="name" fontSize={9} stroke="#B6A9CC" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis fontSize={10} stroke="#B6A9CC" />
              <Tooltip contentStyle={{ background: "#2A1B4A", color: "#F5E9D3", border: "1px solid var(--hairline)" }} />
              <Bar dataKey="count" fill="#E6C87A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminPage>
  );
}
