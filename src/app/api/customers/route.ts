import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const customers = await Customer.find().sort({ createdAt: -1 });
  return NextResponse.json(customers);
}
