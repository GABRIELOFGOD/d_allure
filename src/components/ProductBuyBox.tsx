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
      <div className="mb-5 flex items-center gap-3 font-mono text-sm">
        {hasDiscount ? (
          <>
            <span className="text-lg text-beige">{formatNaira(product.discountPrice!)}</span>
            <span className="text-beige-dim line-through">{formatNaira(product.price)}</span>
            <span className="bg-burgundy/40 px-2 py-1 text-[10px] text-beige">-{product.discountPercent}%</span>
          </>
        ) : (
          <span className="text-lg text-beige">{formatNaira(product.price)}</span>
        )}
      </div>

      {product.customizable && (
        <div className="mb-5">
          <label htmlFor="engraving-name" className="mb-2 block font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim">
            Name to engrave
          </label>
          <input
            id="engraving-name"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g. Amara"
            className="w-full border border-line bg-surface-raised px-4 py-3.5 text-sm text-beige outline-none transition-colors placeholder:text-beige-dim/55 focus:border-beige-dim"
          />
          {savedCustomName && (
            <button
              onClick={() => setCustomName("")}
              className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-beige-dim transition-colors hover:text-beige"
            >
              Clear saved name
            </button>
          )}
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-beige-dim">Quantity</span>
        <div className="flex items-center border border-line">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 text-beige-dim transition-colors hover:text-beige"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-xs">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            disabled={quantity >= product.stock}
            className="h-10 w-10 text-beige-dim transition-colors hover:text-beige disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="w-full bg-burgundy py-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-burgundy-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-beige-dim"
      >
        {outOfStock ? "Out of stock" : "Add to bag"}
      </button>
      <p className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-beige-dim">
        {outOfStock ? "Currently unavailable" : `${product.stock} ${product.stock === 1 ? "bottle" : "bottles"} available`}
      </p>
    </div>
  );
}
