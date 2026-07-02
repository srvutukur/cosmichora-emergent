import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export default function AdminContacts() {
  const [items, setItems] = useState([]);
  const load = () => api.get("/admin/contacts").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const del = async (r) => { if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/contacts/${r.id}`); toast.success("Deleted"); load(); };
  return (
    <AdminPage>
      <AdminHeader title="Contact Forms" subtitle="Inbox from the site" />
      <Table
        columns={[
          { key: "name", label: "Name", w: "180px" },
          { key: "email", label: "Email", w: "220px" },
          { key: "subject", label: "Subject" },
          { key: "message", label: "Message", render: (r) => `${r.message?.slice(0, 70)}…` },
          { key: "created_at", label: "When", w: "140px", render: (r) => new Date(r.created_at).toLocaleDateString() },
          { key: "actions", label: "", w: "60px", render: (r) => <button onClick={() => del(r)} className="btn-secondary" style={{ padding: 6 }}><Trash2 size={12} /></button> },
        ]}
        rows={items}
      />
    </AdminPage>
  );
}
