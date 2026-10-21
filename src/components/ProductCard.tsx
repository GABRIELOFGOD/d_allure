"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;
  const { addItem } = useCart();
  const categoryName = typeof product.category === "object" ? product.category.name : "";
  let badgeLabel = "D_ALLURE";
  if (product.stock <= 0) badgeLabel = "Sold out";
  else if (product.customizable) badgeLabel = "Make it yours";
  else if (hasDiscount) badgeLabel = product.discountPercent ? `-${product.discountPercent}%` : "Sale";

  function handleQuickAdd() {
    if (product.customizable || product.stock <= 0) return;

    addItem({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || "",
      price: hasDiscount ? product.discountPrice! : product.price,
      quantity: 1,
      customizable: false,
    });
    toast.success("Added to bag");
  }

  return (
    <article className="group min-w-0">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-surface-raised">
          <Image
            src={product.images?.[0] || "/logo.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-linear-to-t from-void/35 via-transparent to-void/10" />
          <span className="absolute left-3 top-3 bg-void/75 px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.15em] text-beige backdrop-blur-sm">
            {badgeLabel}
          </span>
          <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-void/45 text-beige opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </Link>
      <div className="flex min-h-29 flex-col justify-between pt-3.5">
        <Link href={`/product/${product.slug}`} className="block">
          {categoryName && (
            <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.16em] text-beige-dim">{categoryName}</p>
          )}
          <h3 className="truncate text-[13px] text-beige transition-colors group-hover:text-white sm:text-sm">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px]">
            {hasDiscount ? (
              <>
                <span className="text-beige">{formatNaira(product.discountPrice!)}</span>
                <span className="text-beige-dim/70 line-through">{formatNaira(product.price)}</span>
              </>
            ) : (
              <span className="text-beige-dim">{formatNaira(product.price)}</span>
            )}
          </div>
        </Link>
        {product.customizable ? (
          <Link
            href={`/product/${product.slug}`}
            className="mt-3 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[8px] uppercase tracking-[0.14em] text-beige-dim transition-colors hover:text-beige"
          >
            Personalize this scent <ArrowUpRight size={13} />
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            aria-label={product.stock <= 0 ? `${product.name} is currently unavailable` : `Add ${product.name} to bag`}
            className="mt-3 flex items-center justify-between border-t border-line pt-2.5 font-mono text-[8px] uppercase tracking-[0.14em] text-beige-dim transition-colors hover:text-beige disabled:cursor-not-allowed disabled:opacity-40"
          >
            {product.stock <= 0 ? "Currently unavailable" : "Add to bag"}
            <ShoppingBag size={13} />
          </button>
        )}
      </div>
    </article>
  );
}
