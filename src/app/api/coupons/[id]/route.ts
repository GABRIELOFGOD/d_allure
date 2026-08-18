import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const body = await req.json();
  if (body.code) body.code = body.code.toUpperCase().trim();

  const coupon = await Coupon.findByIdAndUpdate(id, body, { new: true });
  if (!coupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
  return NextResponse.json(coupon);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Coupon.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
