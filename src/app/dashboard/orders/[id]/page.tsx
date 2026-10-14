"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatNaira } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function changeStatus(status: OrderStatus) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update status");
      setOrder(data);
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update status");
    } finally {
      setUpdating(false);
    }
  }

  async function changePaymentStatus(paymentStatus: "paid" | "refunded") {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't update payment");
      setOrder(data);
      toast.success(paymentStatus === "paid" ? "Payment recorded" : "Refund recorded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update payment");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="font-mono text-sm text-beige-dim">Loading…</p>;
  if (!order) return <p className="font-mono text-sm text-beige-dim">Order not found.</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-beige">{order.trackingId}</h1>
          <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mt-1">
            {new Date(order.createdAt).toLocaleString("en-NG")}
          </p>
        </div>
        <a
          href={`/api/orders/${order._id}/receipt`}
          className="flex items-center gap-2 border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus text-beige hover:border-beige-dim"
        >
          <Download size={14} /> Receipt
        </a>
      </div>

      <div className="border border-line p-5 mb-6">
        <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-3">Status</p>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              disabled={updating}
              className={`px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider border disabled:opacity-50 ${
                order.status === s ? "bg-burgundy border-burgundy text-white" : "border-line text-beige-dim hover:text-beige"
              }`}
            >
              {updating && order.status !== s ? <Loader2 size={11} className="animate-spin inline" /> : s}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-line p-5 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-2">Payment</p>
            <p className={`font-mono text-xs uppercase tracking-wider ${
              order.paymentStatus === "paid" ? "text-green-400" : order.paymentStatus === "refunded" ? "text-burgundy-bright" : "text-beige-dim"
            }`}>
              {order.paymentStatus}
            </p>
            {order.paidAt && <p className="mt-1 text-xs text-beige-dim">Paid {new Date(order.paidAt).toLocaleString("en-NG")}</p>}
            {order.refundedAt && <p className="mt-1 text-xs text-beige-dim">Refunded {new Date(order.refundedAt).toLocaleString("en-NG")}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {order.paymentStatus === "unpaid" && order.status !== "cancelled" && (
              <button
                onClick={() => changePaymentStatus("paid")}
                disabled={updating}
                className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-beige hover:border-beige-dim disabled:opacity-50"
              >
                {updating ? <Loader2 size={12} className="animate-spin" /> : "Record payment"}
              </button>
            )}
            {order.paymentStatus === "paid" && order.status === "cancelled" && (
              <button
                onClick={() => changePaymentStatus("refunded")}
                disabled={updating}
                className="border border-burgundy-bright px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-beige hover:bg-burgundy disabled:opacity-50"
              >
                {updating ? <Loader2 size={12} className="animate-spin" /> : "Record refund"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border border-line p-5 mb-6">
        <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-3">Customer</p>
        <p className="text-sm text-beige">{order.customer.name}</p>
        <p className="text-sm text-beige-dim">{order.customer.email}</p>
        <p className="text-sm text-beige-dim">{order.customer.phone}</p>
        <p className="text-sm text-beige-dim mt-2">{order.customer.address}</p>
        {order.customer.note && (
          <p className="text-sm text-beige-dim mt-2 italic">Note: {order.customer.note}</p>
        )}
      </div>

      <div className="border border-line p-5">
        <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-4">Items</p>
        <ul className="flex flex-col gap-3 mb-4">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-beige">
                {item.name} {item.customName && `("${item.customName}")`} × {item.quantity}
              </span>
              <span className="font-mono text-beige-dim">{formatNaira(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-line pt-3 font-mono text-sm">
          <div className="flex justify-between text-beige-dim">
            <span>Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-beige-dim">
              <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
              <span>- {formatNaira(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-beige text-base mt-2">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
