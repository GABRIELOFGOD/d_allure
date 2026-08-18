import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Customer from "@/models/Customer";
import Review from "@/models/Review";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const [orders, productCount, customerCount, reviews] = await Promise.all([
    Order.find().lean(),
    Product.countDocuments(),
    Customer.countDocuments(),
    Review.find({ approved: true }).lean(),
  ]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const statusBreakdown: Record<string, number> = {};
  for (const o of orders) {
    statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
  }

  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    for (const item of o.items) {
      const key = item.product.toString();
      if (!productSales[key]) productSales[key] = { name: item.name, quantity: 0, revenue: 0 };
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  // Revenue by day for the last 14 days
  const dailyRevenue: Record<string, number> = {};
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dailyRevenue[d.toISOString().slice(0, 10)] = 0;
  }
  for (const o of orders) {
    if (o.status === "cancelled") continue;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (key in dailyRevenue) dailyRevenue[key] += o.total;
  }

  return NextResponse.json({
    totalRevenue,
    totalOrders: orders.length,
    productCount,
    customerCount,
    avgRating: Number(avgRating.toFixed(1)),
    statusBreakdown,
    topProducts,
    dailyRevenue,
  });
}
