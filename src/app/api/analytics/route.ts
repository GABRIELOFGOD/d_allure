import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import Review from "@/models/Review";
import { requireAdmin } from "@/lib/auth";
import type { IOrder } from "@/models/Order";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [orders, productCount, customerCount, reviews] = await Promise.all([
    Order.find().lean().exec() as Promise<IOrder[]>,
    Product.countDocuments(),
    Customer.countDocuments(),
    Review.find({ approved: true }).lean(),
  ]);

  const paidOrders = orders.filter((order) => order.paymentStatus === "paid" || order.paymentStatus === "refunded");
  const collectedRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const totalRefunds = orders
    .filter((order) => order.paymentStatus === "refunded")
    .reduce((sum, order) => sum + order.total, 0);
  const totalRevenue = collectedRevenue - totalRefunds;
  const paidOrderCount = orders.filter((order) => order.paymentStatus === "paid").length;
  const orderValue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const statusBreakdown: Record<string, number> = {};
  for (const o of orders) {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  }

  let unitsSold = 0;
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const o of orders) {
    if (o.status === "cancelled" || o.paymentStatus !== "paid") continue;

    const lineAmounts = o.items.map((item) => item.price * item.quantity);
    const discountShares = lineAmounts.map((amount) =>
      o.subtotal > 0 ? (o.discount * amount) / o.subtotal : 0
    );
    const allocatedDiscounts = discountShares.map(Math.floor);
    const undistributedDiscount = o.discount - allocatedDiscounts.reduce((sum, amount) => sum + amount, 0);
    const remainderOrder = discountShares
      .map((share, index) => ({ index, remainder: share - allocatedDiscounts[index] }))
      .sort((a, b) => b.remainder - a.remainder);
    const remainingShares = Math.min(undistributedDiscount, remainderOrder.length);
    for (let i = 0; i < remainingShares; i++) {
      allocatedDiscounts[remainderOrder[i].index] += 1;
    }

    for (const [index, item] of o.items.entries()) {
      const key = item.product.toString();
      if (!productSales[key]) productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += lineAmounts[index] - allocatedDiscounts[index];
      unitsSold += item.quantity;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Net payment receipts by day for the last 14 days
  const dailyRevenue: Record<string, number> = {};
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyRevenue[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of orders) {
    if (o.paidAt) {
      const key = new Date(o.paidAt).toISOString().slice(0, 10);
      if (key in dailyRevenue) dailyRevenue[key] += o.total;
    }
    if (o.refundedAt) {
      const key = new Date(o.refundedAt).toISOString().slice(0, 10);
      if (key in dailyRevenue) dailyRevenue[key] -= o.total;
    }
  }

  return NextResponse.json({
    totalRevenue,
    collectedRevenue,
    totalRefunds,
    orderValue,
    paidOrderCount,
    unitsSold,
    totalOrders: orders.length,
    productCount,
    customerCount,
    avgRating: Number(avgRating.toFixed(1)),
    statusBreakdown,
    topProducts,
    dailyRevenue,
  });
}
