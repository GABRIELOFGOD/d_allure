"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatNaira } from "@/lib/format";

interface Analytics {
  totalRevenue: number;
  collectedRevenue: number;
  totalRefunds: number;
  orderValue: number;
  paidOrderCount: number;
  unitsSold: number;
  totalOrders: number;
  productCount: number;
  customerCount: number;
  avgRating: number;
  statusBreakdown: Record<string, number>;
  topProducts: { name: string; quantity: number; revenue: number }[];
  dailyRevenue: Record<string, number>;
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="font-mono text-sm text-beige-dim">Loading…</p>;

  const revenueChartData = Object.entries(data.dailyRevenue).map(([date, revenue]) => ({
    date: date.slice(5),
    revenue,
  }));

  const statusChartData = Object.entries(data.statusBreakdown).map(([status, count]) => ({ status, count }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-beige">Overview</h1>
        <a
          href="/api/analytics/export"
          className="flex items-center gap-2 border border-line px-4 py-2.5 font-mono text-xs uppercase tracking-widest-plus text-beige hover:border-beige-dim"
        >
          <Download size={14} /> Export Orders CSV
        </a>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
        <StatCard label="Net revenue" value={formatNaira(data.totalRevenue)} />
        <StatCard label="Collected" value={formatNaira(data.collectedRevenue)} />
        <StatCard label="Refunds" value={formatNaira(data.totalRefunds)} />
        <StatCard label="Active order value" value={formatNaira(data.orderValue)} />
        <StatCard label="Orders" value={String(data.totalOrders)} />
        <StatCard label="Paid orders" value={String(data.paidOrderCount)} />
        <StatCard label="Units sold" value={String(data.unitsSold)} />
        <StatCard label="Products" value={String(data.productCount)} />
        <StatCard label="Customers" value={String(data.customerCount)} />
        <StatCard label="Avg rating" value={data.avgRating ? `${data.avgRating} / 5` : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="border border-line p-5">
          <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-4">
            Net payments — Last 14 Days
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="date" stroke="#b6a891" fontSize={10} />
              <YAxis stroke="#b6a891" fontSize={10} />
              <Tooltip
                contentStyle={{ background: "#1e1512", border: "1px solid #33241f", fontSize: 12 }}
                labelStyle={{ color: "#efe6d8" }}
                formatter={(value) => formatNaira(Number(value ?? 0))}
              />
              <Line type="monotone" dataKey="revenue" stroke="#9c1836" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-line p-5">
          <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-4">Orders by Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusChartData}>
              <XAxis dataKey="status" stroke="#b6a891" fontSize={10} />
              <YAxis stroke="#b6a891" fontSize={10} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1e1512", border: "1px solid #33241f", fontSize: 12 }} />
              <Bar dataKey="count" fill="#9c1836" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border border-line p-5">
        <p className="font-mono text-[11px] text-beige-dim uppercase tracking-widest-plus mb-4">Top Products</p>
        {data.topProducts.length === 0 ? (
          <p className="font-mono text-sm text-beige-dim">No sales yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {data.topProducts.map((p) => (
              <div key={p.name} className="flex justify-between text-sm">
                <span className="text-beige">{p.name}</span>
                <span className="font-mono text-beige-dim">
                  {p.quantity} sold · {formatNaira(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line p-4">
      <p className="font-mono text-[10px] text-beige-dim uppercase tracking-widest-plus mb-1">{label}</p>
      <p className="font-display text-xl text-beige">{value}</p>
    </div>
  );
}
