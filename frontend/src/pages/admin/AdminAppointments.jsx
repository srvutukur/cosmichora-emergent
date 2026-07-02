import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AdminAppointments() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/appointments").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (r) => { if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/appointments/${r.id}`); toast.success("Deleted"); load(); };
  return (
    <AdminPage>
      <AdminHeader title="Appointments" subtitle="Live consultation requests" />
      <Table
        columns={[
          { key: "name", label: "Name", w: "180px" },
          { key: "email", label: "Email", w: "220px" },
          { key: "mobile", label: "Mobile", w: "140px" },
          { key: "date", label: "Date", w: "120px" },
          { key: "time", label: "Time", w: "100px" },
          { key: "topic", label: "Topic" },
          { key: "actions", label: "", w: "60px", render: (r) => <button onClick={() => del(r)} className="btn-secondary" style={{ padding: 6 }}><Trash2 size={12} /></button> },
        ]}
        rows={items}
      />
    </AdminPage>
  );
}
