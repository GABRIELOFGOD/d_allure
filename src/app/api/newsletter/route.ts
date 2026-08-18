import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/Customer";
import { requireAdmin } from "@/lib/auth";
import { sendNewsletterEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const admin = requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { subject, message, target, customerIds } = await req.json();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  let recipients: { email: string }[] = [];

  if (target === "single" || target === "custom") {
    recipients = await Customer.find({ _id: { $in: customerIds } }, "email");
  } else {
    recipients = await Customer.find({ subscribed: true }, "email");
  }

  let sent = 0;
  for (const r of recipients) {
    try {
      await sendNewsletterEmail({ to: r.email, subject, message });
      sent++;
    } catch (e) {
      console.error(`Failed to email ${r.email}:`, e);
    }
  }

  return NextResponse.json({ sent, total: recipients.length });
}
