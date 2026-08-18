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

  async function load() {
    setLoading(true);
    const res = await fetch("/api/products");
    setProducts(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(id: string) {
    if (!confirm("Delete this product permanently?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Product deleted");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-beige">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-burgundy hover:bg-burgundy-bright text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus"
        >
          <Plus size={14} /> New Product
        </Link>
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : products.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No products yet.</p>
      ) : (
        <div className="border border-line">
          {products.map((p) => (
            <div key={p._id} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-b-0">
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
