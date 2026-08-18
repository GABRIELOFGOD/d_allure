import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: NextRequest) {
  await connectDB();
  const { code, subtotal } = await req.json();

  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim(), active: true });
  if (!coupon) return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "This coupon has expired" }, { status: 400 });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
  }

  let discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
  discount = Math.min(discount, subtotal);

  return NextResponse.json({ code: coupon.code, type: coupon.type, value: coupon.value, discount });
}
