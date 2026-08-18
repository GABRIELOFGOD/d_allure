import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Customer from "@/models/Customer";
import Coupon from "@/models/Coupon";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/auth";
import { generateTrackingId, formatNaira } from "@/lib/utils";
import { sendOrderConfirmationEmail } from "@/lib/email";

interface CartItemInput {
  productId: string;
  quantity: number;
  customName?: string;
}

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const query: Record<string, unknown> = {};
  if (status) query.status = status;

  const orders = await Order.find(query).sort({ createdAt: -1 });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { items, customer, couponCode } = body as {
      items: CartItemInput[];
      customer: { name: string; email: string; phone: string; address: string; note?: string };
      couponCode?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return NextResponse.json({ error: "Name, email, phone and address are required" }, { status: 400 });
    }

    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) continue;
      const unitPrice = product.discountPrice || product.price;
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: unitPrice,
        quantity: item.quantity,
        customName: item.customName || undefined,
      });
    }

    if (!orderItems.length) {
      return NextResponse.json({ error: "No valid products in cart" }, { status: 400 });
    }

    let discount = 0;
    let appliedCoupon: string | undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      const notExpired = !coupon?.expiresAt || coupon.expiresAt > new Date();
      const underLimit = !coupon?.usageLimit || coupon.usedCount < coupon.usageLimit;

      if (coupon && notExpired && underLimit) {
        discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
        discount = Math.min(discount, subtotal);
        appliedCoupon = coupon.code;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const total = subtotal - discount;
    const trackingId = generateTrackingId();

    const order = await Order.create({
      trackingId,
      items: orderItems,
      subtotal,
      discount,
      couponCode: appliedCoupon,
      total,
      customer,
      status: "pending",
    });

    const existingCustomer = await Customer.findOne({ email: customer.email.toLowerCase() });
    if (existingCustomer) {
      existingCustomer.orderCount += 1;
      existingCustomer.orderIds.push(order._id);
      existingCustomer.totalSpent += total;
      existingCustomer.name = customer.name;
      existingCustomer.phone = customer.phone;
      existingCustomer.address = customer.address;
      await existingCustomer.save();
    } else {
      await Customer.create({
        name: customer.name,
        email: customer.email.toLowerCase(),
        phone: customer.phone,
        address: customer.address,
        orderCount: 1,
        orderIds: [order._id],
        totalSpent: total,
      });
    }

    sendOrderConfirmationEmail({
      to: customer.email,
      name: customer.name,
      trackingId,
      total: formatNaira(total),
    }).catch((e) => console.error("Email send failed:", e));

    return NextResponse.json(order, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
