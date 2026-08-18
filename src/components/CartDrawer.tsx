"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Minus, Plus, Trash2 } from "lucide-react";
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
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <h2 className="font-display text-lg tracking-widest-plus text-beige">Your Bag</h2>
              <button onClick={() => setIsOpen(false)} aria-label="Close cart" className="text-beige-dim hover:text-beige">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <p className="font-mono text-xs text-beige-dim uppercase tracking-widest-plus mt-10 text-center">
                  Your bag is empty
                </p>
              ) : (
                <ul className="flex flex-col gap-6">
                  {items.map((item) => (
                    <li key={`${item.productId}-${item.customName || ""}`} className="flex gap-4">
                      <div className="relative w-20 h-24 shrink-0 bg-surface-raised overflow-hidden">
                        {item.image && (
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-beige truncate">{item.name}</p>
                        {item.customName && (
                          <p className="font-mono text-[10px] text-beige-dim uppercase tracking-wider mt-0.5">
                            Engraved: &ldquo;{item.customName}&rdquo;
                          </p>
                        )}
                        <p className="font-mono text-xs text-beige-dim mt-1">{formatNaira(item.price)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.customName, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center border border-line text-beige-dim hover:text-beige"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.customName, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center border border-line text-beige-dim hover:text-beige"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.customName)}
                            className="ml-auto text-beige-dim hover:text-burgundy-bright"
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
                <div className="flex justify-between font-mono text-sm text-beige mb-4">
                  <span className="uppercase tracking-widest-plus text-beige-dim">Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full bg-burgundy hover:bg-burgundy-bright text-white py-3.5 font-mono text-xs tracking-widest-plus uppercase transition-colors"
                >
                  Checkout
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
