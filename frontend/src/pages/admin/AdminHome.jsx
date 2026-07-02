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
        <StatCard label="Revenue" value={`₹${a.revenue.toLocaleString("en-IN")}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6" style={{ background: "white", border: "1px solid rgba(58,48,42,0.08)" }}>
          <div className="eyebrow mb-4">Revenue · last 14 days</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={a.daily}>
              <CartesianGrid stroke="rgba(58,48,42,0.06)" vertical={false} />
              <XAxis dataKey="date" fontSize={10} stroke="#4C4643" />
              <YAxis fontSize={10} stroke="#4C4643" />
              <Tooltip contentStyle={{ background: "#F9F8F3", border: "1px solid rgba(58,48,42,0.15)" }} />
              <Line type="monotone" dataKey="revenue" stroke="#3A302A" strokeWidth={2} dot={{ fill: "#B89764" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6" style={{ background: "white", border: "1px solid rgba(58,48,42,0.08)" }}>
          <div className="eyebrow mb-4">Orders by report type</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={a.by_type}>
              <CartesianGrid stroke="rgba(58,48,42,0.06)" vertical={false} />
              <XAxis dataKey="name" fontSize={9} stroke="#4C4643" interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis fontSize={10} stroke="#4C4643" />
              <Tooltip contentStyle={{ background: "#F9F8F3", border: "1px solid rgba(58,48,42,0.15)" }} />
              <Bar dataKey="count" fill="#B89764" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminPage>
  );
}
