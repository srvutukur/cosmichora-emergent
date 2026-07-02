import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage, Table } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const EMPTY = { slug: "", title: "", excerpt: "", content: "", author: "Cosmic Hora Team", cover_image: "", tags: [], published: true };

export default function AdminBlogs() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);

  const load = () => api.get("/admin/blogs").then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);
  const submit = async () => {
    try {
      const payload = { ...form, tags: Array.isArray(form.tags) ? form.tags : String(form.tags).split(",").map((t) => t.trim()).filter(Boolean) };
      if (editId) await api.put(`/admin/blogs/${editId}`, payload);
      else await api.post("/admin/blogs", payload);
      toast.success("Saved"); setOpen(false); setForm(EMPTY); setEditId(null); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };
  const del = async (r) => { if (!window.confirm("Delete?")) return;
    await api.delete(`/admin/blogs/${r.id}`); toast.success("Deleted"); load(); };
  const edit = (r) => { setForm({ ...EMPTY, ...r, tags: (r.tags || []).join(", ") }); setEditId(r.id); setOpen(true); };

  return (
    <AdminPage>
      <AdminHeader title="Journal" subtitle="Editorial content"
        actions={<button data-testid="blog-add-btn" className="btn-primary" onClick={() => { setEditId(null); setForm(EMPTY); setOpen(true); }}><Plus size={14} /> New post</button>} />
      <Table
        columns={[
          { key: "title", label: "Title" },
          { key: "slug", label: "Slug", w: "220px" },
          { key: "author", label: "Author", w: "160px" },
          { key: "published", label: "Live", w: "80px", render: (r) => (r.published ? "Yes" : "No") },
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
          <div className="w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto" style={{ background: "var(--espresso)", border: "1px solid var(--hairline)", borderRadius: 20 }}>
            <div className="flex justify-between mb-6"><div className="font-display text-3xl">Blog post</div><button onClick={() => setOpen(false)}><X /></button></div>
            <div className="grid md:grid-cols-2 gap-6">
              <F label="Title"><input className="input-editorial" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></F>
              <F label="Slug"><input className="input-editorial" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></F>
              <F label="Author"><input className="input-editorial" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></F>
              <F label="Tags (comma sep.)"><input className="input-editorial" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></F>
              <F label="Excerpt" span2><textarea rows={2} className="input-editorial" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></F>
              <F label="Content (plain text)" span2><textarea rows={10} className="input-editorial" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></F>
              <F label="Published"><select className="input-editorial" value={String(form.published)} onChange={(e) => setForm({ ...form, published: e.target.value === "true" })}><option value="true">Yes</option><option value="false">No</option></select></F>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
              <button data-testid="blog-save-btn" className="btn-primary" onClick={submit}>Save</button>
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
