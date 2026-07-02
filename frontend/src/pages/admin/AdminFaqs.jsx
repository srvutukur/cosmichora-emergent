import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const EMPTY = { question: "", answer: "", category: "General", order: 0, active: true };

export default function AdminFaqs() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get("/admin/faqs").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const submit = async () => {
    try {
      if (editId) await api.put(`/admin/faqs/${editId}`, form);
      else await api.post("/admin/faqs", form);
      toast.success("Saved"); setOpen(false); setForm(EMPTY); setEditId(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };
  const del = async (r) => { if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/faqs/${r.id}`); toast.success("Deleted"); load(); };
  const edit = (r) => { setForm({ ...EMPTY, ...r }); setEditId(r.id); setOpen(true); };

  return (
    <AdminPage>
      <AdminHeader title="FAQ" subtitle="Questions we hear often"
        actions={<button className="btn-primary" onClick={() => { setEditId(null); setForm(EMPTY); setOpen(true); }}><Plus size={14} /> New</button>} />
      <Table
        columns={[
          { key: "question", label: "Question" },
          { key: "category", label: "Category", w: "140px" },
          { key: "order", label: "Order", w: "80px" },
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(5,3,15,0.72)" }}>
          <div className="w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto" style={{ background: "var(--espresso)", border: "1px solid var(--hairline)", borderRadius: 20 }}>
            <div className="flex justify-between mb-6"><div className="font-display text-3xl">FAQ</div><button onClick={() => setOpen(false)}><X /></button></div>
            <div className="space-y-6">
              <F label="Question"><input className="input-editorial" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></F>
              <F label="Answer"><textarea rows={4} className="input-editorial" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></F>
              <F label="Category"><input className="input-editorial" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></F>
              <F label="Order"><input type="number" className="input-editorial" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || 0, 10) })} /></F>
              <F label="Active"><select className="input-editorial" value={String(form.active)} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></F>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button className="btn-primary" onClick={submit}>Save</button>
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
