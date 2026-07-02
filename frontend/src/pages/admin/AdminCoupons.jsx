import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const EMPTY = { code: "", discount_percent: 10, active: true, max_uses: 0, description: "" };

export default function AdminCoupons() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get("/admin/coupons").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      if (editId) await api.put(`/admin/coupons/${editId}`, form);
      else await api.post("/admin/coupons", form);
      toast.success("Saved"); setOpen(false); setForm(EMPTY); setEditId(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };
  const del = async (r) => { if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/coupons/${r.id}`); toast.success("Deleted"); load(); };
  const edit = (r) => { setForm({ ...EMPTY, ...r }); setEditId(r.id); setOpen(true); };

  return (
    <AdminPage>
      <AdminHeader title="Coupons" subtitle="Promotional codes"
        actions={<button data-testid="coup-add-btn" className="btn-primary" onClick={() => { setEditId(null); setForm(EMPTY); setOpen(true); }}><Plus size={14} /> New coupon</button>} />
      <Table
        columns={[
          { key: "code", label: "Code" },
          { key: "discount_percent", label: "Discount", render: (r) => `${r.discount_percent}%` },
          { key: "description", label: "Description" },
          { key: "active", label: "Active", w: "80px", render: (r) => (r.active ? "Yes" : "No") },
          { key: "actions", label: "", w: "120px", render: (r) => (
            <div className="flex gap-2">
              <button onClick={() => edit(r)} className="btn-secondary" style={{ padding: 6 }}><Edit2 size={12} /></button>
              <button onClick={() => del(r)} className="btn-secondary" style={{ padding: 6 }}><Trash2 size={12} /></button>
            </div>
          )},
        ]}
        rows={items}
      />
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(31,29,26,0.5)" }}>
          <div className="w-full max-w-lg p-8" style={{ background: "var(--bone)" }}>
            <div className="flex justify-between mb-6"><div className="font-display text-3xl">Coupon</div><button onClick={() => setOpen(false)}><X /></button></div>
            <div className="space-y-6">
              <F label="Code"><input className="input-editorial" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} /></F>
              <F label="Discount %"><input type="number" className="input-editorial" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: parseFloat(e.target.value || 0) })} /></F>
              <F label="Description"><input className="input-editorial" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
              <F label="Active"><select className="input-editorial" value={String(form.active)} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></F>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button data-testid="coup-save-btn" className="btn-primary" onClick={submit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function F({ label, children }) {
  return <label className="block"><span className="eyebrow block mb-2">{label}</span>{children}</label>;
}
