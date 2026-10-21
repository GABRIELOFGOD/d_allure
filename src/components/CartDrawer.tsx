"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import CheckoutModal from "./CheckoutModal";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, subtotal, updateQuantity, removeItem } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-surface border-l border-line flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.2em] text-burgundy-bright">D_ALLURE</p>
                <h2 className="font-display text-2xl text-beige">Your bag <span className="font-body text-xs text-beige-dim">({items.length})</span></h2>
              </div>
              <button onClick={() => setIsOpen(false)} aria-label="Close cart" className="text-beige-dim transition-colors hover:text-beige">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line text-beige-dim">
                    <ShoppingBag size={20} />
                  </span>
                  <h3 className="font-display text-2xl text-beige">A little room for allure.</h3>
                  <p className="mt-2 max-w-[230px] text-xs leading-5 text-beige-dim">Your bag is waiting for a scent that feels like you.</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsOpen(false)}
                    className="mt-6 inline-flex items-center gap-3 bg-burgundy px-5 py-3 font-mono text-[9px] uppercase tracking-[0.15em] text-white transition-colors hover:bg-burgundy-hover"
                  >
                    Explore the collection <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.customName || ""}`} className="flex gap-4 border-b border-line pb-5">
                      <div className="relative h-28 w-22 shrink-0 overflow-hidden bg-surface-raised">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-beige">{item.name}</p>
                        {item.customName && (
                          <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.12em] text-beige-dim">
                            Engraved · &ldquo;{item.customName}&rdquo;
                          </p>
                        )}
                        <p className="mt-2 font-mono text-xs text-beige">{formatNaira(item.price)}</p>
                        <div className="mt-3 flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, item.customName, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center border border-line text-beige-dim transition-colors hover:text-beige"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-4 text-center font-mono text-[10px]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.customName, item.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center border border-line text-beige-dim transition-colors hover:text-beige"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.customName)}
                            className="ml-auto text-beige-dim transition-colors hover:text-burgundy-bright"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-line px-6 py-5">
                <div className="mb-4 flex justify-between font-mono text-sm text-beige">
                  <span className="text-[9px] uppercase tracking-[0.16em] text-beige-dim">Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="flex w-full items-center justify-between bg-burgundy px-5 py-4 font-mono text-[9px] uppercase tracking-[0.17em] text-white transition-colors hover:bg-burgundy-hover"
                >
                  Continue to checkout <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
    </>
  );
}
