import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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

interface CheckoutPayload {
  items: CartItemInput[];
  customer: { name: string; email: string; phone: string; address: string; note?: string };
  couponCode?: string;
}

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

function isCheckoutPayload(value: unknown): value is CheckoutPayload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  const customer = body.customer;
  if (!customer || typeof customer !== "object" || Array.isArray(customer)) return false;
  const customerFields = customer as Record<string, unknown>;

  return (
    Array.isArray(body.items) &&
    body.items.length > 0 &&
    body.items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof item.productId === "string" &&
        mongoose.isValidObjectId(item.productId) &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        (item.customName === undefined || typeof item.customName === "string")
    ) &&
    typeof customerFields.name === "string" &&
    !!customerFields.name.trim() &&
    typeof customerFields.email === "string" &&
    !!customerFields.email.trim() &&
    typeof customerFields.phone === "string" &&
    !!customerFields.phone.trim() &&
    typeof customerFields.address === "string" &&
    !!customerFields.address.trim() &&
    (customerFields.note === undefined || typeof customerFields.note === "string") &&
    (body.couponCode === undefined || typeof body.couponCode === "string")
  );
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
  const session = await mongoose.startSession();
  let order: InstanceType<typeof Order> | undefined;

  try {
    await connectDB();
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
    }
    if (!isCheckoutPayload(body)) {
      return NextResponse.json({ error: "Cart items and customer details are invalid" }, { status: 400 });
    }

    const { items, customer, couponCode } = body;
    const stockQuantities = new Map<string, number>();
    const orderLines = new Map<string, { productId: string; quantity: number; customName?: string }>();
    for (const item of items) {
      const customName = item.customName?.trim();
      stockQuantities.set(item.productId, (stockQuantities.get(item.productId) || 0) + item.quantity);
      const lineKey = `${item.productId}::${customName || ""}`;
      const existingLine = orderLines.get(lineKey);
      orderLines.set(lineKey, {
        productId: item.productId,
        quantity: (existingLine?.quantity || 0) + item.quantity,
        customName,
      });
    }

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;
      const products = new Map<
        string,
        {
          _id: mongoose.Types.ObjectId;
          name: string;
          discountPrice?: number;
          price: number;
          customizable: boolean;
          images: string[];
        }
      >();

      for (const [productId, quantity] of stockQuantities) {
        const product = await Product.findOneAndUpdate(
          { _id: productId, active: true, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { returnDocument: "after", session }
        );
        if (!product) {
          const availableProduct = await Product.findById(productId).session(session);
          if (!availableProduct || !availableProduct.active) {
            throw new CheckoutError("A product in your bag is no longer available", 409);
          }
          throw new CheckoutError(
            `Not enough stock for ${availableProduct.name}. Only ${availableProduct.stock} available.`,
            409
          );
        }
        products.set(productId, product);
      }

      for (const line of orderLines.values()) {
        const product = products.get(line.productId);
        if (!product) throw new Error("Reserved product was not found in the checkout transaction");
        const quantity = line.quantity;
        const unitPrice = product.discountPrice || product.price;
        subtotal += unitPrice * quantity;
        if (line.customName && !product.customizable) {
          throw new CheckoutError(`${product.name} cannot be personalized`, 400);
        }
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || "",
          price: unitPrice,
          quantity,
          customName: line.customName,
        });
      }

      let discount = 0;
      let appliedCoupon: string | undefined;
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true }).session(session);
        if (
          !coupon ||
          (coupon.expiresAt && coupon.expiresAt <= new Date()) ||
          (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
        ) {
          throw new CheckoutError("This coupon is no longer valid. Please remove it and try again.", 409);
        }

        discount = coupon.type === "percent" ? Math.round((subtotal * coupon.value) / 100) : coupon.value;
        discount = Math.min(discount, subtotal);
        appliedCoupon = coupon.code;
        coupon.usedCount += 1;
        await coupon.save({ session });
      }

      const trackingId = generateTrackingId();
      const [createdOrder] = await Order.create(
        [{
          trackingId,
          items: orderItems,
          subtotal,
          discount,
          couponCode: appliedCoupon,
          total: subtotal - discount,
          customer,
          status: "pending",
          paymentStatus: "unpaid",
          inventoryReserved: true,
        }],
        { session }
      );
      order = createdOrder;

      await Customer.findOneAndUpdate(
        { email: customer.email.toLowerCase() },
        {
          $set: {
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
          },
          $setOnInsert: { totalSpent: 0 },
          $inc: { orderCount: 1 },
          $addToSet: { orderIds: createdOrder._id },
        },
        { upsert: true, new: true, session, setDefaultsOnInsert: true }
      );
    });

    if (!order) throw new Error("Checkout transaction completed without creating an order");

    sendOrderConfirmationEmail({
      to: customer.email,
      name: customer.name,
      trackingId: order.trackingId,
      total: formatNaira(order.total),
    }).catch((e) => console.error("Email send failed:", e));

    return NextResponse.json(order, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof CheckoutError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await session.endSession();
  }
}
