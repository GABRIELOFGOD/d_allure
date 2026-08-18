"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/dashboard/Modal";
import { FormField, inputClass } from "@/components/dashboard/FormField";
import type { Coupon } from "@/types";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", usageLimit: "", expiresAt: "" });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/coupons");
    setCoupons(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    if (!form.code.trim() || !form.value) {
      toast.error("Code and value are required");
      return;
    }
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        expiresAt: form.expiresAt || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.error || "Couldn't create coupon");
      return;
    }
    toast.success("Coupon created");
    setShowForm(false);
    setForm({ code: "", type: "percent", value: "", usageLimit: "", expiresAt: "" });
    load();
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/coupons/${coupon._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !coupon.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    toast.success("Coupon deleted");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-beige">Coupons</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy-bright text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus"
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : coupons.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No coupons yet.</p>
      ) : (
        <div className="border border-line">
          {coupons.map((c) => (
            <div key={c._id} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-b-0">
              <div className="font-mono text-sm text-beige w-32 shrink-0">{c.code}</div>
              <div className="font-mono text-xs text-beige-dim flex-1">
                {c.type === "percent" ? `${c.value}% off` : `₦${c.value} off`} · used {c.usedCount}
                {c.usageLimit ? `/${c.usageLimit}` : ""}
              </div>
              <button
                onClick={() => toggleActive(c)}
                className={`font-mono text-[10px] uppercase tracking-wider px-2 py-1 border ${
                  c.active ? "border-beige text-beige" : "border-line text-beige-dim"
                }`}
              >
                {c.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => remove(c._id)} className="text-beige-dim hover:text-burgundy-bright">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="New Coupon" onClose={() => setShowForm(false)}>
          <FormField label="Code">
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="e.g. ALLURE10"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Type">
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="percent">Percent %</option>
                <option value="fixed">Fixed ₦</option>
              </select>
            </FormField>
            <FormField label="Value">
              <input
                type="number"
                className={inputClass}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Usage Limit (optional)">
              <input
                type="number"
                className={inputClass}
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
              />
            </FormField>
            <FormField label="Expires (optional)">
              <input
                type="date"
                className={inputClass}
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </FormField>
          </div>
          <button
            onClick={create}
            className="w-full bg-burgundy hover:bg-burgundy-bright text-white py-3 font-mono text-xs uppercase tracking-widest-plus mt-2"
          >
            Create Coupon
          </button>
        </Modal>
      )}
    </div>
  );
}
