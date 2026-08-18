import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  const body = await req.json();
  if (body.name) body.slug = slugify(body.name);

  const category = await Category.findByIdAndUpdate(id, body, { new: true });
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectDB();
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
