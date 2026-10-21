"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { FormField, inputClass } from "@/components/dashboard/FormField";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", image: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", image: "" });
    setShowForm(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || "", image: cat.image || "" });
    setShowForm(true);
  }

  async function save() {
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    const url = editing ? `/api/categories/${editing._id}` : "/api/categories";
    const method = editing ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      toast.error("Couldn't save category");
      return;
    }
    toast.success(editing ? "Category updated" : "Category created");
    setShowForm(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category? Products in it will keep their reference but won't be filterable by it.")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    toast.success("Category deleted");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-beige">Categories</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy-hover text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus"
        >
          <Plus size={14} /> New Category
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : categories.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No categories yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-beige">{cat.name}</h3>
                  <p className="font-mono text-[10px] text-beige-dim uppercase tracking-wider mt-1">{cat.slug}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="text-beige-dim hover:text-beige">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => remove(cat._id)} className="text-beige-dim hover:text-burgundy-bright">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {cat.description && <p className="text-xs text-beige-dim mt-3">{cat.description}</p>}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={editing ? "Edit Category" : "New Category"} onClose={() => setShowForm(false)}>
          <FormField label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Description (optional)">
            <textarea
              className={inputClass}
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </FormField>
          <FormField label="Image URL (optional, Cloudinary)">
            <input
              className={inputClass}
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            />
          </FormField>
          <button
            onClick={save}
            className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3 font-mono text-xs uppercase tracking-widest-plus mt-2"
          >
            Save Category
          </button>
        </Modal>
      )}
    </div>
  );
}
