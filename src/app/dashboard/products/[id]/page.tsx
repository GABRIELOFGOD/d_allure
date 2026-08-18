"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/dashboard/ProductForm";
import type { Product } from "@/types";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <h1 className="font-display text-3xl text-beige mb-8">Edit Product</h1>
      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : product ? (
        <ProductForm product={product} />
      ) : (
        <p className="font-mono text-sm text-beige-dim">Product not found.</p>
      )}
    </div>
  );
}
