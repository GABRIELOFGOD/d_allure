import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const [customers, paidTotals] = await Promise.all([
    Customer.find().sort({ createdAt: -1 }).lean(),
    Order.aggregate<{ _id: string; totalSpent: number }>([
      { $match: { paymentStatus: "paid" } },
      {
        $group: {
          _id: { $toLower: "$customer.email" },
          totalSpent: { $sum: "$total" },
        },
      },
    ]),
  ]);
  const totalsByEmail = new Map(paidTotals.map((entry) => [entry._id, entry.totalSpent]));
  return NextResponse.json(
    customers.map((customer) => ({
      ...customer,
      totalSpent: totalsByEmail.get(customer.email.toLowerCase()) ?? 0,
    }))
  );
}
