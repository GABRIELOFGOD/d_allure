"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Download, Search } from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";

const STATUS_STEPS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingId, setTrackingId] = useState(searchParams.get("id") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(id: string) {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track/${id.trim().toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }
      setOrder(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("id")) lookup(searchParams.get("id")!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canDownloadReceipt = order && (order.status === "delivered" || order.status === "cancelled");
  const isCancelled = order?.status === "cancelled";
  const currentStepIndex = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-6 md:px-10 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim mb-2">Order Status</p>
      <h1 className="font-display text-4xl text-beige mb-10">Track Your Order</h1>

      <div className="flex gap-2 mb-10">
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup(trackingId)}
          placeholder="e.g. DA-7F3K2Q"
          className="flex-1 bg-surface-raised border border-line px-4 py-3 text-sm text-beige outline-none focus:border-beige-dim font-mono"
        />
        <button
          onClick={() => lookup(trackingId)}
          disabled={loading}
          className="bg-burgundy hover:bg-burgundy-bright text-white px-5 flex items-center gap-2 font-mono text-xs tracking-widest-plus uppercase"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Track
        </button>
      </div>

      {error && <p className="font-mono text-sm text-burgundy-bright mb-6">{error}</p>}

      {order && (
        <div>
          <div className="border border-line p-6 mb-8">
            <div className="flex justify-between mb-1">
              <span className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim">Tracking ID</span>
              <span className="font-mono text-sm text-beige">{order.trackingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[11px] uppercase tracking-widest-plus text-beige-dim">Placed</span>
              <span className="font-mono text-sm text-beige-dim">
                {new Date(order.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {isCancelled ? (
            <p className="font-mono text-sm text-burgundy-bright uppercase tracking-widest-plus mb-8">Order Cancelled</p>
          ) : (
            <div className="flex justify-between mb-10">
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className="flex-1 flex flex-col items-center relative">
                  {i > 0 && (
                    <div
                      className={`absolute top-1.5 right-1/2 w-full h-px ${i <= currentStepIndex ? "bg-burgundy-bright" : "bg-line"}`}
                    />
                  )}
                  <div
                    className={`relative z-10 w-3 h-3 rounded-full ${
                      i <= currentStepIndex ? "bg-burgundy-bright" : "bg-line"
                    }`}
                  />
                  <span
                    className={`font-mono text-[9px] uppercase tracking-wider mt-2 text-center ${
                      i <= currentStepIndex ? "text-beige" : "text-beige-dim"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          )}

          <ul className="flex flex-col gap-4 mb-6">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-beige">
                  {item.name} {item.customName && `("${item.customName}")`} × {item.quantity}
                </span>
                <span className="font-mono text-beige-dim">{formatNaira(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-line pt-4 font-mono text-sm mb-8">
            <div className="flex justify-between text-beige">
              <span>Total</span>
              <span>{formatNaira(order.total)}</span>
            </div>
          </div>

          {canDownloadReceipt ? (
            <a
              href={`/api/orders/${order.trackingId}/receipt`}
              className="inline-flex items-center gap-2 border border-line text-beige px-5 py-3 font-mono text-xs tracking-widest-plus uppercase hover:border-beige-dim transition-colors"
            >
              <Download size={14} />
              Download Receipt
            </a>
          ) : (
            <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus">
              Receipt available once your order is delivered or cancelled
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackContent />
    </Suspense>
  );
}
