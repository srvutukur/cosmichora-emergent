import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const EMPTY = { slug: "", title: "", tagline: "", description: "", price: 0, currency: "INR",
  duration_days: 1, image_url: "", icon: "sparkles", highlights: [], active: true, prompt_template: "" };

export default function AdminReportTypes() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get("/report-types?all=true").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    try {
      if (editId) await api.put(`/admin/report-types/${editId}`, form);
      else await api.post("/admin/report-types", form);
      toast.success(editId ? "Updated" : "Created");
      setOpen(false); setEditId(null); setForm(EMPTY); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const edit = (r) => { setForm({ ...EMPTY, ...r }); setEditId(r.id); setOpen(true); };
  const del = async (r) => { if (!window.confirm("Delete this report type?")) return;
    await api.delete(`/admin/report-types/${r.id}`); toast.success("Deleted"); load(); };

  return (
    <AdminPage>
      <AdminHeader
        title="Report Types" subtitle="Add or edit — no code required"
        actions={
          <button data-testid="rt-add-btn" className="btn-primary" onClick={() => { setEditId(null); setForm(EMPTY); setOpen(true); }}>
            <Plus size={14} /> New report type
          </button>
        }
      />
      <Table
        columns={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug", w: "180px" },
          { key: "price", label: "Price", w: "100px", render: (r) => `₹${r.price}` },
          { key: "active", label: "Active", w: "80px", render: (r) => (r.active ? "Yes" : "No") },
          { key: "actions", label: "", w: "120px", render: (r) => (
            <div className="flex gap-2">
              <button data-testid={`rt-edit-${r.id}`} onClick={() => edit(r)} className="btn-secondary" style={{ padding: 6 }}><Edit2 size={12} /></button>
              <button data-testid={`rt-del-${r.id}`} onClick={() => del(r)} className="btn-secondary" style={{ padding: 6 }}><Trash2 size={12} /></button>
            </div>
          )},
        ]}
        rows={items}
      />

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(31,29,26,0.5)" }}>
          <div className="w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: "var(--bone)" }}>
            <div className="flex justify-between items-start mb-6">
              <div className="font-display text-3xl" style={{ color: "var(--obsidian)" }}>{editId ? "Edit" : "New"} report type</div>
              <button onClick={() => setOpen(false)}><X /></button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <F label="Title"><input className="input-editorial" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></F>
              <F label="Slug"><input className="input-editorial" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></F>
              <F label="Tagline"><input className="input-editorial" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></F>
              <F label="Price (₹)"><input type="number" className="input-editorial" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value || 0) })} /></F>
              <F label="Icon"><input className="input-editorial" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} /></F>
              <F label="Active"><select className="input-editorial" value={String(form.active)} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></F>
              <F label="Description" span2><textarea rows={3} className="input-editorial" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></F>
              <F label="Prompt template (used to guide the AI)" span2><textarea rows={3} className="input-editorial" value={form.prompt_template} onChange={(e) => setForm({ ...form, prompt_template: e.target.value })} /></F>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button data-testid="rt-save-btn" className="btn-primary" onClick={submit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}

function F({ label, children, span2 }) {
  return <label className={`block ${span2 ? "md:col-span-2" : ""}`}><span className="eyebrow block mb-2">{label}</span>{children}</label>;
}
