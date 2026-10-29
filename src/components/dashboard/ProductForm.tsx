"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { FormField, inputClass } from "@/components/dashboard/FormField";
import CloudinaryUploader, { type CloudinaryUploaderHandle } from "@/components/dashboard/CloudinaryUploader";
import type { Category, Product } from "@/types";

interface ProductFormState {
  name: string;
  description: string;
  category: string;
  price: string;
  hasDiscount: boolean;
  discountAmount: string;
  images: string[];
  videos: string[];
  customizable: boolean;
  stock: string;
  featured: boolean;
  active: boolean;
}

const emptyForm: ProductFormState = {
  name: "",
  description: "",
  category: "",
  price: "",
  hasDiscount: false,
  discountAmount: "",
  images: [],
  videos: [],
  customizable: true,
  stock: "0",
  featured: false,
  active: true,
};

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const imageUploaderRef = useRef<CloudinaryUploaderHandle>(null);
  const videoUploaderRef = useRef<CloudinaryUploaderHandle>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
  }, []);

  useEffect(() => {
    if (product) {
      // Calculate discount amount from original price and discount price
      const discountAmount = product.discountPrice ? product.price - product.discountPrice : 0;
      setForm({
        name: product.name,
        description: product.description,
        category: typeof product.category === "object" ? product.category._id : product.category,
        price: String(product.discountPrice || product.price),
        hasDiscount: !!product.discountPrice,
        discountAmount: discountAmount ? String(discountAmount) : "",
        images: product.images || [],
        videos: product.videos || [],
        customizable: product.customizable,
        stock: String(product.stock),
        featured: product.featured,
        active: product.active,
      });
    }
  }, [product]);

  function set<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category || !form.price || !form.description.trim()) {
      toast.error("Name, category, description and price are required");
      return;
    }

    setSaving(true);
    try {
      // Upload pending files first
      const images = await imageUploaderRef.current?.uploadPendingFiles() ?? form.images;
      const videos = await videoUploaderRef.current?.uploadPendingFiles() ?? form.videos;

      // Calculate original price if discount is applied
      const sellingPrice = Number(form.price);
      const discountAmount = form.hasDiscount ? Number(form.discountAmount || 0) : 0;
      const originalPrice = sellingPrice + discountAmount;

      const payload = {
        name: form.name,
        description: form.description,
        category: form.category,
        price: form.hasDiscount ? originalPrice : sellingPrice,
        hasDiscount: form.hasDiscount,
        discountPrice: form.hasDiscount ? sellingPrice : undefined,
        discountAmount: form.hasDiscount ? discountAmount : undefined,
        images,
        videos,
        customizable: form.customizable,
        stock: Number(form.stock),
        featured: form.featured,
        active: form.active,
      };

      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const message =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : `Couldn't save product (HTTP ${res.status})`;
        toast.error(message);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/dashboard/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <FormField label="Product Name">
        <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
      </FormField>

      <FormField label="Description">
        <textarea className={inputClass} rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </FormField>

      <FormField label="Category">
        <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Price - Customer Pays (₦)">
          <input
            type="number"
            className={inputClass}
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </FormField>
        <FormField label="Stock">
          <input
            type="number"
            className={inputClass}
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </FormField>
      </div>

      <div className="border border-line p-4 mb-4">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-beige-dim mb-3">
          <input type="checkbox" checked={form.hasDiscount} onChange={(e) => set("hasDiscount", e.target.checked)} />
          Apply Discount
        </label>
        {form.hasDiscount && (
          <FormField label="Discount Amount (₦) - Added to Price">
            <input
              type="number"
              className={inputClass}
              value={form.discountAmount}
              onChange={(e) => set("discountAmount", e.target.value)}
              placeholder="e.g., 5000"
            />
          </FormField>
        )}
      </div>

      <FormField label="Images">
        <CloudinaryUploader ref={imageUploaderRef} urls={form.images} onChange={(urls) => set("images", urls)} resourceType="image" />
      </FormField>

      <FormField label="Videos (optional)">
        <CloudinaryUploader ref={videoUploaderRef} urls={form.videos} onChange={(urls) => set("videos", urls)} resourceType="video" />
      </FormField>

      <div className="flex flex-wrap gap-6 mb-6">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-beige-dim">
          <input type="checkbox" checked={form.customizable} onChange={(e) => set("customizable", e.target.checked)} />
          Customizable (name engraving)
        </label>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-beige-dim">
          <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-beige-dim">
          <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
          Active / Visible
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-burgundy hover:bg-burgundy-hover text-white px-6 py-3 font-mono text-xs uppercase tracking-widest-plus flex items-center gap-2"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {product ? "Save Changes" : "Create Product"}
      </button>
    </div>
  );
}
