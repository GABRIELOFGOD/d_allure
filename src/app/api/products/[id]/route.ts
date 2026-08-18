import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { slugify, applyDiscount } from "@/lib/utils";

async function findProduct(id: string) {
  await connectDB();
  const isSlug = !id.match(/^[0-9a-fA-F]{24}$/);
  return isSlug
    ? Product.findOne({ slug: id, active: true }).populate("category")
    : Product.findById(id).populate("category");
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await findProduct(id);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const body = await req.json();

  if (body.name) body.slug = slugify(body.name);

  if (body.hasDiscount === false) {
    body.discountPrice = undefined;
    body.discountPercent = undefined;
  } else if (body.discountPrice !== undefined && body.price) {
    // New format: discountPrice is provided directly
    body.discountPercent = Math.round(((body.price - body.discountPrice) / body.price) * 100);
  } else if (body.hasDiscount && body.discountPercent && body.price) {
    // Old format: calculate discountPrice from percent
    body.discountPrice = applyDiscount(body.price, body.discountPercent);
  }

  const product = await Product.findByIdAndUpdate(id, body, { new: true });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
