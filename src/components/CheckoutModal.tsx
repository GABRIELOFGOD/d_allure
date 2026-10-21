"use client";

import { useState } from "react";
import Link from "next/link";
import { X, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/format";
import type { Order } from "@/types";

export default function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", note: "" });
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ discount: number; code: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const discount = couponResult?.discount || 0;
  const total = Math.max(subtotal - discount, 0);

  function updateField(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Invalid coupon");
        setCouponResult(null);
        return;
      }
      setCouponResult({ discount: data.discount, code: data.code });
      toast.success(`Coupon ${data.code} applied`);
    } catch {
      toast.error("Couldn't validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitOrder() {
    if (!form.name || !form.email || !form.phone || !form.address) {
      toast.error("Name, email, phone and address are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            customName: i.customName,
          })),
          customer: form,
          couponCode: couponResult?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }
      setCompletedOrder(data);
      clearCart();
    } catch {
      toast.error("Couldn't place your order — check your connection and try again");
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349039194587";
  const whatsappMessage = completedOrder
    ? encodeURIComponent(
        `Hi D_ALLURE, I'd like to complete payment for my order.\nTracking ID: ${completedOrder.trackingId}\nTotal: ${formatNaira(completedOrder.total)}\nName: ${completedOrder.customer.name}`
      )
    : "";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80" onClick={submitting ? undefined : onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface border border-line p-7">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-beige-dim hover:text-beige"
          aria-label="Close checkout"
        >
          <X size={20} />
        </button>

        {completedOrder ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-burgundy flex items-center justify-center mx-auto mb-5">
              <Check size={22} className="text-white" />
            </div>
            <h3 className="font-display text-xl text-beige mb-2">Order Received</h3>
            <p className="font-mono text-xs text-beige-dim uppercase tracking-widest-plus mb-1">Tracking ID</p>
            <p className="font-mono text-lg text-beige tracking-widest-plus mb-6">{completedOrder.trackingId}</p>
            <p className="text-sm text-beige-dim mb-6">
              A confirmation has been sent to your email. Your items are reserved while you continue on WhatsApp to pay.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-burgundy hover:bg-burgundy-hover text-white py-3.5 font-mono text-xs tracking-widest-plus uppercase transition-colors mb-3"
            >
              Continue on WhatsApp to Pay
            </a>
            <Link
              href={`/track?id=${completedOrder.trackingId}`}
              className="block w-full border border-line text-beige py-3.5 font-mono text-xs tracking-widest-plus uppercase hover:border-beige-dim transition-colors"
              onClick={onClose}
            >
              Track This Order
            </Link>
          </div>
        ) : (
          <>
            <h3 className="font-display text-xl text-beige mb-6">Checkout</h3>

            <div className="flex flex-col gap-4">
              <Field label="Full Name" required value={form.name} onChange={(v) => updateField("name", v)} />
              <Field label="Email" type="email" required value={form.email} onChange={(v) => updateField("email", v)} />
              <Field label="Phone Number" required value={form.phone} onChange={(v) => updateField("phone", v)} />
              <Field label="Delivery Address" required value={form.address} onChange={(v) => updateField("address", v)} textarea />
              <Field label="Order Note (optional)" value={form.note} onChange={(v) => updateField("note", v)} textarea />

              <div>
                <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
                  Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige focus:border-beige-dim outline-none"
                    placeholder="Enter code"
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    className="border border-line px-4 text-xs font-mono uppercase tracking-widest-plus text-beige hover:border-beige-dim disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                  </button>
                </div>
              </div>

              <div className="border-t border-line pt-4 mt-2 font-mono text-sm">
                <div className="flex justify-between text-beige-dim">
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-beige-dim mt-1">
                    <span>Discount ({couponResult?.code})</span>
                    <span>- {formatNaira(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-beige mt-2 text-base">
                  <span>Total</span>
                  <span>{formatNaira(total)}</span>
                </div>
              </div>

              <button
                onClick={submitOrder}
                disabled={submitting}
                className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3.5 font-mono text-xs tracking-widest-plus uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Place Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2 block">
        {label} {required && <span className="text-burgundy-bright">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="w-full bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige focus:border-beige-dim outline-none resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-surface-raised border border-line px-3 py-2.5 text-sm text-beige focus:border-beige-dim outline-none"
        />
      )}
    </div>
  );
}
