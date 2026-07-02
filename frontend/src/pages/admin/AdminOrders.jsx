import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { Download } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/admin/orders").then((r) => setOrders(r.data)); }, []);
  return (
    <AdminPage>
      <AdminHeader title="Orders" subtitle="Every reading, every payment" />
      <Table
        columns={[
          { key: "id", label: "Order", w: "120px", render: (r) => `#${r.id.slice(-6)}` },
          { key: "user_email", label: "User" },
          { key: "report_title", label: "Report" },
          { key: "amount", label: "Amount", w: "110px", render: (r) => `₹${r.amount}` },
          { key: "status", label: "Status", w: "120px" },
          { key: "created_at", label: "Created", w: "150px", render: (r) => new Date(r.created_at).toLocaleDateString() },
          { key: "actions", label: "", w: "80px", render: (r) => r.status === "completed" && (
            <a href={`${api.defaults.baseURL}/orders/${r.id}/pdf`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "6px 10px", fontSize: 11 }}>
              <Download size={12} /> PDF
            </a>
          )},
        ]}
        rows={orders}
      />
    </AdminPage>
  );
}
