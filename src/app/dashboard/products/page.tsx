"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setSelectedIds([]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function toggleSelected(id: string) {
    setSelectedIds((selected) =>
      selected.includes(id) ? selected.filter((selectedId) => selectedId !== id) : [...selected, id]
    );
  }

  function toggleAllSelected() {
    setSelectedIds((selected) =>
      selected.length === products.length ? [] : products.map((product) => product._id)
    );
  }

  async function remove(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Couldn't delete product");
      }
      toast.success("Product deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete product");
    }
  }

  async function removeSelected() {
    const ids = selectedIds;
    if (!ids.length || !confirm(`Permanently delete ${ids.length} selected ${ids.length === 1 ? "product" : "products"}? This cannot be undone.`)) return;

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't delete selected products");

      toast.success(`${data.deletedCount} ${data.deletedCount === 1 ? "product" : "products"} deleted`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete selected products");
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-beige">Products</h1>
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <>
              <span className="font-mono text-[10px] uppercase tracking-wider text-beige-dim">
                {selectedIds.length} selected
              </span>
              <button
                onClick={removeSelected}
                className="flex items-center gap-2 border border-burgundy-bright px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-beige transition-colors hover:bg-burgundy"
              >
                <Trash2 size={14} /> Delete selected
              </button>
            </>
          )}
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 bg-burgundy px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus text-white hover:bg-burgundy-bright"
          >
            <Plus size={14} /> New Product
          </Link>
        </div>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : products.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No products yet.</p>
      ) : (
        <div className="border border-line">
          <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
            <input
              type="checkbox"
              checked={selectedIds.length === products.length}
              onChange={toggleAllSelected}
              aria-label={selectedIds.length === products.length ? "Deselect all products" : "Select all products"}
              className="accent-burgundy-bright"
            />
            <span className="font-mono text-[9px] uppercase tracking-wider text-beige-dim">
              {selectedIds.length === products.length ? "All products selected" : "Select all products"}
            </span>
          </div>
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-b-0">
              <input
                type="checkbox"
                checked={selectedIds.includes(p._id)}
                onChange={() => toggleSelected(p._id)}
                aria-label={`Select ${p.name}`}
                className="accent-burgundy-bright"
              />
              <div className="relative w-12 h-14 bg-surface-raised shrink-0">
                {p.images?.[0] && <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="48px" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-beige truncate">{p.name}</p>
                <p className="font-mono text-[10px] text-beige-dim uppercase tracking-wider mt-0.5">
                  {typeof p.category === "object" ? p.category.name : ""} · Stock: {p.stock}
                  {!p.active && " · Inactive"}
                </p>
              </div>
              <div className="font-mono text-sm text-beige-dim shrink-0">
                {p.discountPrice ? formatNaira(p.discountPrice) : formatNaira(p.price)}
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href={`/dashboard/products/${p._id}`} className="text-beige-dim hover:text-beige">
                  <Pencil size={15} />
                </Link>
                <button onClick={() => remove(p._id)} className="text-beige-dim hover:text-burgundy-bright">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
