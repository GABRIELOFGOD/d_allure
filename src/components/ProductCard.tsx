"use client";

import Link from "next/link";
import Image from "next/image";
import { formatNaira } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discountPrice && product.discountPrice < product.price;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-surface overflow-hidden">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-beige-dim font-display text-sm">
            D_ALLURE
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-burgundy text-white text-[10px] font-mono tracking-widest-plus uppercase px-2 py-1">
            -{product.discountPercent}%
          </span>
        )}
      </div>
      <div className="pt-3">
        <h3 className="text-sm text-beige group-hover:text-white transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1 font-mono text-xs">
          {hasDiscount ? (
            <>
              <span className="text-beige">{formatNaira(product.discountPrice!)}</span>
              <span className="text-beige-dim line-through">{formatNaira(product.price)}</span>
            </>
          ) : (
            <span className="text-beige-dim">{formatNaira(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
