import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomDiscountPercent, applyDiscount } from "@/lib/utils";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const admin = requireAdmin(req);

  const query: Record<string, unknown> = admin ? {} : { active: true };
  if (category) query.category = category;
  if (featured) query.featured = true;

  const products = await Product.find(query).populate("category").sort({ createdAt: -1 });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await connectDB();
    const body = await req.json();

    let discountPrice: number | undefined;
    let discountPercent: number | undefined;

    if (body.hasDiscount || body.discountPrice) {
      // If discountPrice is already provided (new format from ProductForm)
      if (body.discountPrice) {
        discountPrice = body.discountPrice;
        // Calculate discount percent if needed
        if (body.price && body.discountPrice) {
          discountPercent = Math.round(((body.price - body.discountPrice) / body.price) * 100);
        }
      } else if (body.discountPercent) {
        // Old format with discount percent
        const percent = Number(body.discountPercent);
        discountPercent = percent;
        discountPrice = applyDiscount(body.price, percent);
      } else {
        // Random discount
        const percent = randomDiscountPercent();
        discountPercent = percent;
        discountPrice = applyDiscount(body.price, percent);
      }
    }

    const product = await Product.create({
      name: body.name,
      slug: slugify(body.name),
      description: body.description,
      category: body.category,
      price: body.price,
      discountPrice,
      discountPercent,
      images: body.images || [],
      videos: body.videos || [],
      customizable: body.customizable ?? true,
      stock: body.stock ?? 0,
      featured: body.featured ?? false,
      active: body.active ?? true,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
