import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { slugify, randomDiscountPercent, applyDiscount, escapeRegex } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("q")?.trim().slice(0, 100);
    const admin = requireAdmin(req);

    const query: Record<string, unknown> = admin ? {} : { active: true };
    if (category) query.category = category;
    if (featured) query.featured = true;
    if (search) query.name = { $regex: escapeRegex(search), $options: "i" };

    if (searchParams.has("page") || searchParams.has("limit")) {
      const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
      const requestedLimit = Number.parseInt(searchParams.get("limit") || "10", 10);
      const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
      const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 10;
      const [products, total] = await Promise.all([
        Product.find(query).populate("category").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Product.countDocuments(query),
      ]);
      return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
    }

    const products = await Product.find(query).populate("category").sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

export async function DELETE(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("ids" in body) ||
    !Array.isArray(body.ids) ||
    body.ids.length === 0 ||
    !body.ids.every((id): id is string => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id))
  ) {
    return NextResponse.json({ error: "Provide one or more valid product IDs" }, { status: 400 });
  }

  await connectDB();
  const result = await Product.deleteMany({ _id: { $in: [...new Set(body.ids)] } });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
