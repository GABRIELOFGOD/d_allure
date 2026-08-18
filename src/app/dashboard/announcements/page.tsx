"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { FormField, inputClass } from "@/components/dashboard/FormField";
import type { Announcement } from "@/types";

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/announcements");
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!text.trim()) {
      toast.error("Announcement text is required");
      return;
    }
    await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    toast.success("Announcement added");
    setText("");
    setShowForm(false);
    load();
  }

  async function toggleActive(item: Announcement) {
    await fetch(`/api/announcements/${item._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !item.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    toast.success("Announcement deleted");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-beige">Announcements</h1>
          <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mt-1">
            Shown in the scrolling banner at the top of the site
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy-bright text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus"
        >
          <Plus size={14} /> New
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : items.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No announcements — the banner is currently hidden.</p>
      ) : (
        <div className="border border-line">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-b-0">
              <p className="flex-1 text-sm text-beige">{item.text}</p>
              <button
                onClick={() => toggleActive(item)}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border ${
                  item.active ? "border-beige text-beige" : "border-line text-beige-dim"
                }`}
              >
                {item.active ? "Live" : "Hidden"}
              </button>
              <button onClick={() => remove(item._id)} className="text-beige-dim hover:text-burgundy-bright">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New Announcement" onClose={() => setShowForm(false)}>
          <FormField label="Text">
            <textarea className={inputClass} rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </FormField>
          <button
            onClick={create}
            className="w-full bg-burgundy hover:bg-burgundy-bright text-white py-3 font-mono text-xs uppercase tracking-widest-plus mt-2"
          >
            Add Announcement
          </button>
        </Modal>
      )}
    </div>
  );
}
