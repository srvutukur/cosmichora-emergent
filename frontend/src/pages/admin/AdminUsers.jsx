import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setUsers(r.data)); }, []);
  return (
    <AdminPage>
      <AdminHeader title="Users" subtitle="Registered seekers" />
      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role", w: "120px" },
          { key: "mobile", label: "Mobile", w: "160px" },
          { key: "created_at", label: "Joined", w: "160px", render: (r) => new Date(r.created_at).toLocaleDateString() },
        ]}
        rows={users}
      />
    </AdminPage>
  );
}
