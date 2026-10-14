import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import { requireAdmin } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const PAYMENT_STATUSES = ["unpaid", "paid", "refunded"] as const;

class OrderUpdateError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  }
  const updates = body as Record<string, unknown>;
  if (
    (updates.status === undefined || ORDER_STATUSES.includes(updates.status as (typeof ORDER_STATUSES)[number])) &&
    (updates.paymentStatus === undefined || PAYMENT_STATUSES.includes(updates.paymentStatus as (typeof PAYMENT_STATUSES)[number])) &&
    (updates.status !== undefined || updates.paymentStatus !== undefined)
  ) {
    const session = await mongoose.startSession();
    let updatedOrder: InstanceType<typeof Order> | null = null;
    let statusChanged = false;

    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(id).session(session);
        if (!order) throw new OrderUpdateError("Order not found", 404);

        const nextStatus = updates.status as (typeof ORDER_STATUSES)[number] | undefined;
        const nextPaymentStatus = updates.paymentStatus as (typeof PAYMENT_STATUSES)[number] | undefined;
        const previousStatus = order.status;
        statusChanged = nextStatus !== undefined && nextStatus !== previousStatus;

        if (statusChanged && nextStatus === "cancelled" && order.inventoryReserved) {
          for (const item of order.items) {
            const result = await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: item.quantity } },
              { session }
            );
            if (result.matchedCount !== 1) {
              throw new OrderUpdateError(`Cannot cancel order: ${item.name} no longer exists in inventory`, 409);
            }
          }
          order.inventoryReserved = false;
        } else if (statusChanged && previousStatus === "cancelled" && nextStatus !== "cancelled" && !order.inventoryReserved) {
          if (order.paymentStatus === "refunded") {
            throw new OrderUpdateError("A refunded order cannot be reopened", 409);
          }
          for (const item of order.items) {
            const product = await Product.findOneAndUpdate(
              { _id: item.product, active: true, stock: { $gte: item.quantity } },
              { $inc: { stock: -item.quantity } },
              { returnDocument: "after", session }
            );
            if (!product) {
              const existing = await Product.findById(item.product).session(session);
              const available = existing?.stock ?? 0;
              throw new OrderUpdateError(
                `Cannot reopen order: ${item.name} has ${available} available, but ${item.quantity} are required`,
                409
              );
            }
          }
          order.inventoryReserved = true;
        }

        if (statusChanged) order.status = nextStatus!;

        if (nextPaymentStatus !== undefined && nextPaymentStatus !== order.paymentStatus) {
          if (order.paymentStatus === "unpaid" && nextPaymentStatus === "paid" && order.status !== "cancelled") {
            order.paymentStatus = "paid";
            order.paidAt = new Date();
            order.refundedAt = undefined;
          } else if (order.paymentStatus === "paid" && nextPaymentStatus === "refunded" && order.status === "cancelled") {
            order.paymentStatus = "refunded";
            order.refundedAt = new Date();
          } else {
            throw new OrderUpdateError(
              "Payments can only be marked paid for active orders, and refunds can only be recorded for paid, cancelled orders",
              409
            );
          }
        }

        await order.save({ session });
        updatedOrder = order;

        if (nextPaymentStatus !== undefined) {
          const customerEmail = order.customer.email.toLowerCase();
          const [customerSales] = await Order.aggregate<{ totalSpent: number }>([
            {
              $match: {
                paymentStatus: "paid",
                $expr: { $eq: [{ $toLower: "$customer.email" }, customerEmail] },
              },
            },
            { $group: { _id: null, totalSpent: { $sum: "$total" } } },
          ]).session(session);
          await Customer.updateOne(
            { email: customerEmail },
            { $set: { totalSpent: customerSales?.totalSpent ?? 0 } },
            { session }
          );
        }
      });

      if (!updatedOrder) throw new Error("Order update transaction completed without an order");

      if (statusChanged) {
        sendOrderStatusEmail({
          to: updatedOrder.customer.email,
          name: updatedOrder.customer.name,
          trackingId: updatedOrder.trackingId,
          status: updatedOrder.status,
        }).catch((e) => console.error("Email send failed:", e));
      }

      return NextResponse.json(updatedOrder);
    } catch (err: unknown) {
      if (err instanceof OrderUpdateError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      const message = err instanceof Error ? err.message : "Couldn't update order";
      return NextResponse.json({ error: message }, { status: 500 });
    } finally {
      await session.endSession();
    }
  }

  return NextResponse.json({ error: "Invalid order status or payment status" }, { status: 400 });
}
