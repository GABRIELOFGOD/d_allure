import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();

  const header = [
    "Tracking ID",
    "Date",
    "Status",
    "Payment Status",
    "Paid At",
    "Refunded At",
    "Stock Reserved",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "Items",
    "Subtotal",
    "Discount",
    "Coupon",
    "Total",
  ];

  const rows = orders.map((o) => [
    o.trackingId,
    new Date(o.createdAt).toISOString(),
    o.status,
    o.paymentStatus || "unpaid",
    o.paidAt ? new Date(o.paidAt).toISOString() : "",
    o.refundedAt ? new Date(o.refundedAt).toISOString() : "",
    o.inventoryReserved ?? false,
    o.customer.name,
    o.customer.email,
    o.customer.phone,
    o.customer.address,
    o.items.map((i: { name: string; customName?: string; quantity: number }) => `${i.name}${i.customName ? ` (${i.customName})` : ""} x${i.quantity}`).join(" | "),
    o.subtotal,
    o.discount,
    o.couponCode || "",
    o.total,
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="d-allure-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
