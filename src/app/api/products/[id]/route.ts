import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { applyDiscount } from "@/lib/utils";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await connectDB();
  const product = await Product.findById(id).populate("category");
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    if (!/^[0-9a-f]{24}$/i.test(id)) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const parsedBody: unknown = await req.json().catch(() => null);
    if (typeof parsedBody !== "object" || parsedBody === null || Array.isArray(parsedBody)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    const body = parsedBody as Record<string, unknown>;
    const update: Record<string, unknown> = { ...body };
    delete update.hasDiscount;
    delete update.slug;

    if (body.hasDiscount === false) {
      delete update.discountPrice;
      delete update.discountPercent;
      update.$unset = { discountPrice: 1, discountPercent: 1 };
    } else if (typeof body.discountPrice === "number" && typeof body.price === "number" && body.price) {
      // New format: discountPrice is provided directly
      update.discountPercent = Math.round(((body.price - body.discountPrice) / body.price) * 100);
    } else if (body.hasDiscount && typeof body.discountPercent === "number" && typeof body.price === "number" && body.price) {
      // Old format: calculate discountPrice from percent
      update.discountPrice = applyDiscount(body.price, body.discountPercent);
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
