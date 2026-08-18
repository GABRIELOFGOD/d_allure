import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const body = await req.json();

  const order = await Order.findByIdAndUpdate(id, { status: body.status }, { new: true });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  sendOrderStatusEmail({
    to: order.customer.email,
    name: order.customer.name,
    trackingId: order.trackingId,
    status: order.status,
  }).catch((e) => console.error("Email send failed:", e));

  return NextResponse.json(order);
}
