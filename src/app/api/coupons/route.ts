import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return NextResponse.json(coupons);
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();
    const coupon = await Coupon.create({
      code: body.code.toUpperCase().trim(),
      type: body.type,
      value: body.value,
      usageLimit: body.usageLimit || undefined,
      expiresAt: body.expiresAt || undefined,
      active: body.active ?? true,
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
