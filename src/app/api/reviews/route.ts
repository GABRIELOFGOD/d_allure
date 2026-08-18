import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product");
  const admin = requireAdmin(req);

  const query: Record<string, unknown> = admin ? {} : { approved: true };
  if (productId) query.product = productId;

  const reviews = await Review.find(query).sort({ createdAt: -1 });
  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { trackingId, productId, rating, comment, name } = body;

    const order = await Order.findOne({ trackingId: String(trackingId).toUpperCase() });
    if (!order) {
      return NextResponse.json({ error: "We couldn't find an order with that tracking ID" }, { status: 404 });
    }

    const purchased = order.items.some((item: { product: { toString(): string } }) => item.product.toString() === productId);
    if (!purchased) {
      return NextResponse.json({ error: "This product wasn't part of that order" }, { status: 400 });
    }

    const review = await Review.create({
      product: productId,
      order: order._id,
      trackingId: order.trackingId,
      name,
      rating,
      comment,
      approved: false,
    });

    return NextResponse.json(review, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "You've already reviewed this product for that order" }, { status: 409 });
    }
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
