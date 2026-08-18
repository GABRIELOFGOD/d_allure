"use client";

import { useEffect, useState } from "react";
import { formatNaira } from "@/lib/format";
import type { Customer } from "@/types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-beige mb-8">Customers</h1>

      {loading ? (
        <p className="font-mono text-sm text-beige-dim">Loading…</p>
      ) : customers.length === 0 ? (
        <p className="font-mono text-sm text-beige-dim">No customers yet.</p>
      ) : (
        <div className="border border-line">
          {customers.map((c) => (
            <div key={c._id} className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-b-0">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-beige truncate">{c.name}</p>
                <p className="font-mono text-[10px] text-beige-dim uppercase tracking-wider">{c.email} · {c.phone}</p>
              </div>
              <div className="font-mono text-xs text-beige-dim shrink-0">{c.orderCount} orders</div>
              <div className="font-mono text-sm text-beige shrink-0">{formatNaira(c.totalSpent)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
