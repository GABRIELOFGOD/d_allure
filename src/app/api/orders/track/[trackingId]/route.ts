import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ trackingId: string }> }) {
  const { trackingId } = await params;
  await connectDB();
  const order = await Order.findOne({ trackingId: trackingId.toUpperCase() });
  if (!order) return NextResponse.json({ error: "No order found with that tracking ID" }, { status: 404 });
  return NextResponse.json(order);
}
