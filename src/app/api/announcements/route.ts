import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Announcement from "@/models/Announcement";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  await connectDB();
  const admin = requireAdmin(req);
  const query = admin ? {} : { active: true };
  const announcements = await Announcement.find(query).sort({ createdAt: -1 });
  return NextResponse.json(announcements);
}

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const announcement = await Announcement.create({ text: body.text, active: body.active ?? true });
  return NextResponse.json(announcement, { status: 201 });
}
