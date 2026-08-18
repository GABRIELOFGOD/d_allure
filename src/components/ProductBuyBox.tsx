"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductBuyBox({ product }: { product: Product }) {
  const { addItem, savedCustomName, setSavedCustomName } = useCart();
  const [customName, setCustomName] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product.customizable) setCustomName(savedCustomName);
  }, [product.customizable, savedCustomName]);

  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const unitPrice = hasDiscount ? product.discountPrice! : product.price;
  const outOfStock = product.stock <= 0;

  function handleAddToCart() {
    if (product.customizable && !customName.trim()) {
      toast.error("Please enter a name to engrave on the bottle");
      return;
    }

    if (product.customizable && customName.trim()) {
      setSavedCustomName(customName.trim());
    }

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || "",
      price: unitPrice,
      quantity,
      customName: product.customizable ? customName.trim() : undefined,
      customizable: product.customizable,
    });
    toast.success("Added to bag");
  }

  return (
    <div>
      <div className="flex items-center gap-3 font-mono text-sm mb-6">
        {hasDiscount ? (
          <>
            <span className="text-beige text-lg">{formatNaira(product.discountPrice!)}</span>
            <span className="text-beige-dim line-through">{formatNaira(product.price)}</span>
            <span className="text-burgundy-bright text-xs">-{product.discountPercent}%</span>
          </>
        ) : (
          <span className="text-beige text-lg">{formatNaira(product.price)}</span>
        )}
      </div>

      {product.customizable && (
        <div className="mb-6">
          <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
            Name to Engrave
          </label>
          <input
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Amara"
            className="w-full bg-surface-raised border border-line px-3 py-3 text-sm text-beige focus:border-beige-dim outline-none"
          />
          {savedCustomName && (
            <button
              onClick={() => setCustomName("")}
              className="font-mono text-[10px] text-beige-dim hover:text-beige uppercase tracking-widest-plus mt-2"
            >
              Clear saved name
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <span className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim">Qty</span>
        <div className="flex items-center border border-line">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 text-beige-dim hover:text-beige"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="w-9 h-9 text-beige-dim hover:text-beige"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="w-full bg-burgundy hover:bg-burgundy-bright disabled:bg-line disabled:text-beige-dim text-white py-4 font-mono text-xs tracking-widest-plus uppercase transition-colors"
      >
        {outOfStock ? "Out of Stock" : "Add to Bag"}
      </button>
    </div>
  );
}
