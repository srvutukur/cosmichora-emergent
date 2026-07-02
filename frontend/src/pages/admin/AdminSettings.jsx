import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { AdminHeader, AdminPage } from "../../components/admin/AdminBits";
import { toast } from "sonner";
import { Save } from "lucide-react";

const GROUPS = [
  { title: "Website content", prefix: "site.", hint: "Public marketing copy" },
  { title: "Email templates", prefix: "email_template.", hint: "Notifications sent to customers" },
  { title: "AI prompt templates", prefix: "prompt.", hint: "Guidance for the report generation engine" },
  { title: "API keys", prefix: "api_key.", hint: "Third-party service credentials (never exposed publicly)" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const load = () => api.get("/admin/settings").then((r) => setSettings(r.data));
  useEffect(() => { load(); }, []);

  const save = async (key, value) => {
    try { await api.put(`/admin/settings/${key}`, { key, value }); toast.success("Saved"); }
    catch (e) { toast.error(e.response?.data?.detail || "Error"); }
  };

  const newSetting = async (prefix) => {
    const k = window.prompt(`New key (will be prefixed with '${prefix}')`);
    if (!k) return;
    await save(`${prefix}${k}`, "");
    load();
  };

  return (
    <AdminPage>
      <AdminHeader title="Settings" subtitle="Site content, prompts, templates & API keys" />

      <div className="space-y-14">
        {GROUPS.map((g) => {
          const items = settings.filter((s) => s.key.startsWith(g.prefix));
          return (
            <section key={g.prefix}>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <h2 className="font-display text-2xl" style={{ color: "var(--obsidian)" }}>{g.title}</h2>
                  <div className="text-xs" style={{ color: "var(--charcoal)" }}>{g.hint}</div>
                </div>
                <button className="btn-secondary" onClick={() => newSetting(g.prefix)}>Add key</button>
              </div>
              <div className="space-y-3">
                {items.map((s) => (
                  <SettingRow key={s.key} setting={s} onSave={save} isSecret={g.prefix === "api_key."} />
                ))}
                {items.length === 0 && <div className="text-sm" style={{ color: "var(--charcoal)" }}>No keys yet.</div>}
              </div>
            </section>
          );
        })}
      </div>
    </AdminPage>
  );
}

function SettingRow({ setting, onSave, isSecret }) {
  const [val, setVal] = useState(setting.value ?? "");
  const large = typeof setting.value === "string" && (setting.value.length > 60 || setting.key.includes("template") || setting.key.includes("prompt"));
  return (
    <div className="grid md:grid-cols-[280px_1fr_auto] gap-3 items-center p-4" style={{ background: "white", border: "1px solid rgba(58,48,42,0.08)" }}>
      <div className="text-xs font-mono" style={{ color: "var(--espresso)" }}>{setting.key}</div>
      {large ? (
        <textarea rows={3} className="input-editorial" value={val} onChange={(e) => setVal(e.target.value)} />
      ) : (
        <input type={isSecret ? "password" : "text"} className="input-editorial" value={val} onChange={(e) => setVal(e.target.value)} />
      )}
      <button className="btn-secondary" onClick={() => onSave(setting.key, val)}><Save size={12} /> Save</button>
    </div>
  );
}
