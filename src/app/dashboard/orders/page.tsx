"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { Order, OrderStatus } from "@/types";

const STATUSES: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "text-beige-dim",
  confirmed: "text-beige",
  processing: "text-beige",
  shipped: "text-beige",
  delivered: "text-green-400",
  cancelled: "text-burgundy-bright",
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  async function load(status: OrderStatus | "all") {
    setLoading(true);
    const url = status === "all" ? "/api/orders" : `/api/orders?status=${status}`;
    const res = await fetch(url);
    setOrders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load(filter);
  }, [filter]);

  return (
    <div>
      <h1 className="font-display text-3xl text-beige mb-8">Orders</h1>

      <div className="flex flex-wrap gap-2 mb-6 font-mono text-[11px] uppercase tracking-wider">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 border ${filter === s ? "border-beige text-beige" : "border-line text-beige-dim"}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No orders found.</p>
      ) : (
        <div className="border border-line">
          {orders.map((o) => (
            <Link
              key={o._id}
              href={`/dashboard/orders/${o._id}`}
              className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-b-0 hover:bg-surface-raised transition-colors"
            >
              <div className="font-mono text-sm text-beige w-28 shrink-0">{o.trackingId}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-beige truncate">{o.customer.name}</p>
                <p className="font-mono text-[10px] text-beige-dim uppercase tracking-wider">{o.customer.email}</p>
              </div>
              <div className="font-mono text-sm text-beige-dim shrink-0">{formatNaira(o.total)}</div>
              <div className={`font-mono text-[11px] uppercase tracking-wider w-24 shrink-0 text-right ${STATUS_COLORS[o.status]}`}>
                {o.status}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
