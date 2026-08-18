"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { CartItem } from "@/types";

const CART_KEY = "d_allure_cart";
const NAME_KEY = "d_allure_custom_name";

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, customName?: string) => void;
  updateQuantity: (productId: string, customName: string | undefined, quantity: number) => void;
  clearCart: () => void;
  savedCustomName: string;
  setSavedCustomName: (name: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(productId: string, customName?: string) {
  return `${productId}::${customName || ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [savedCustomName, setSavedCustomNameState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw));
      const name = localStorage.getItem(NAME_KEY);
      if (name) setSavedCustomNameState(name);
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const setSavedCustomName = useCallback((name: string) => {
    setSavedCustomNameState(name);
    if (name) localStorage.setItem(NAME_KEY, name);
    else localStorage.removeItem(NAME_KEY);
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const key = itemKey(item.productId, item.customName);
      const existing = prev.find((i) => itemKey(i.productId, i.customName) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.customName) === key ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, customName?: string) => {
    const key = itemKey(productId, customName);
    setItems((prev) => prev.filter((i) => itemKey(i.productId, i.customName) !== key));
  }, []);

  const updateQuantity = useCallback((productId: string, customName: string | undefined, quantity: number) => {
    const key = itemKey(productId, customName);
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => itemKey(i.productId, i.customName) !== key)
        : prev.map((i) => (itemKey(i.productId, i.customName) === key ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        savedCustomName,
        setSavedCustomName,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
