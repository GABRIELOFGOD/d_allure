"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Plus, Pencil, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/types";

const PAGE_SIZE = 10;

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (nextPage: number, query: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams({ page: String(nextPage), limit: String(PAGE_SIZE) });
      if (query) params.set("q", query);
      const res = await fetch(`/api/products?${params}`, { cache: "no-store" });
      const data: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : `Couldn't load products (HTTP ${res.status})`;
        throw new Error(message);
      }
      if (
        typeof data !== "object" ||
        data === null ||
        !("products" in data) ||
        !Array.isArray(data.products) ||
        !("total" in data) ||
        typeof data.total !== "number"
      ) {
        throw new Error("The products response was invalid");
      }
      setProducts(data.products);
      setTotal(data.total);
      setPage(nextPage);
      setSelectedIds([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't load products";
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, "");
  }, [load]);

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

  function searchProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchInput.trim();
    setSearch(query);
    void load(1, query);
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
      await load(1, search);
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
      await load(1, search);
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
            className="flex items-center gap-2 bg-burgundy px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus text-white hover:bg-burgundy-hover"
          >
            <Plus size={14} /> New Product
          </Link>
        </div>
      </div>

      <form onSubmit={searchProducts} className="mb-6 flex max-w-xl gap-2">
        <label htmlFor="admin-product-search" className="sr-only">Search products</label>
        <input
          id="admin-product-search"
          type="search"
          maxLength={100}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search products by name"
          className="min-w-0 flex-1 border border-line bg-surface px-4 py-3 text-sm text-beige placeholder:text-beige-dim"
        />
        <button
          type="submit"
          className="flex items-center gap-2 bg-surface-raised px-4 py-3 font-mono text-xs uppercase tracking-wider text-beige hover:bg-burgundy"
        >
          <Search size={14} /> Search
        </button>
      </form>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : loadError ? (
        <div>
          <p className="font-mono text-sm text-beige-dim">{loadError}</p>
          <button onClick={() => void load(page, search)} className="mt-3 font-mono text-xs text-beige underline">
            Try again
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">
          {search ? `No products found for “${search}”.` : "No products yet."}
        </p>
      ) : (
        <div className="border border-line">
          <div className="flex items-center gap-3 border-b border-line bg-surface px-5 py-3">
            <input
              type="checkbox"
              checked={selectedIds.length === products.length}
              onChange={toggleAllSelected}
              aria-label={selectedIds.length === products.length ? "Deselect all products on this page" : "Select all products on this page"}
              className="accent-burgundy-bright"
            />
            <span className="font-mono text-[9px] uppercase tracking-wider text-beige-dim">
              {selectedIds.length === products.length ? "All products on this page selected" : "Select all on this page"}
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

      {!loading && !loadError && total > PAGE_SIZE && (
        <div className="mt-5 flex items-center justify-between">
          <p className="font-mono text-xs text-beige-dim">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} products
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => void load(page - 1, search)}
              disabled={page === 1}
              aria-label="Previous products page"
              className="border border-line p-2 text-beige-dim hover:text-beige disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => void load(page + 1, search)}
              disabled={page * PAGE_SIZE >= total}
              aria-label="Next products page"
              className="border border-line p-2 text-beige-dim hover:text-beige disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
