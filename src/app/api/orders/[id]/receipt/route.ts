import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth";
import { formatNaira } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const isTrackingId = !id.match(/^[0-9a-fA-F]{24}$/);
  const order = isTrackingId
    ? await Order.findOne({ trackingId: id.toUpperCase() })
    : await Order.findById(id);

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const admin = requireAdmin(req);
  const allowedForCustomer = order.status === "delivered" || order.status === "cancelled";
  if (!admin && !allowedForCustomer) {
    return NextResponse.json(
      { error: "Receipt is only available once the order is completed or cancelled" },
      { status: 403 }
    );
  }

  const doc = new PDFDocument({ margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const burgundy = "#5c0a1f";
  const beige = "#efe6d8";

  doc.rect(0, 0, doc.page.width, 90).fill(burgundy);
  doc.fillColor(beige).fontSize(24).text("D_ALLURE", 50, 30, { characterSpacing: 4 });
  doc.fontSize(9).text("SMELL EXPENSIVE, STAY UNFORGETTABLE", 50, 60, { characterSpacing: 1 });

  doc.fillColor("#111").fontSize(16).text("Order Receipt", 50, 115);
  doc.fontSize(10).fillColor("#444");
  doc.text(`Tracking ID: ${order.trackingId}`, 50, 140);
  doc.text(`Status: ${order.status.toUpperCase()}`, 50, 156);
  doc.text(`Payment: ${(order.paymentStatus || "unpaid").toUpperCase()}`, 50, 172);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString("en-NG")}`, 50, 188);

  doc.text(`Customer: ${order.customer.name}`, 320, 140);
  doc.text(`Email: ${order.customer.email}`, 320, 156);
  doc.text(`Phone: ${order.customer.phone}`, 320, 172);
  doc.text(`Address: ${order.customer.address}`, 320, 188, { width: 220 });

  let y = 230;
  doc.moveTo(50, y).lineTo(545, y).strokeColor(beige).lineWidth(1).stroke();
  y += 12;
  doc.fontSize(10).fillColor("#111").text("Item", 50, y).text("Qty", 350, y).text("Price", 420, y).text("Total", 490, y);
  y += 18;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#ddd").stroke();
  y += 10;

  for (const item of order.items) {
    const label = item.customName ? `${item.name} ("${item.customName}")` : item.name;
    doc.fontSize(9).fillColor("#333").text(label, 50, y, { width: 280 });
    doc.text(String(item.quantity), 350, y);
    doc.text(formatNaira(item.price), 420, y);
    doc.text(formatNaira(item.price * item.quantity), 490, y);
    y += 24;
  }

  y += 6;
  doc.moveTo(320, y).lineTo(545, y).strokeColor("#ddd").stroke();
  y += 12;
  doc.fontSize(9).text("Subtotal", 420, y).text(formatNaira(order.subtotal), 490, y);
  y += 16;
  if (order.discount) {
    doc.text(`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, 420, y).text(`- ${formatNaira(order.discount)}`, 490, y);
    y += 16;
  }
  doc.fontSize(11).fillColor("#111").text("Total", 420, y).text(formatNaira(order.total), 490, y);

  doc.fontSize(8).fillColor("#999").text(
    "Thank you for shopping with D_ALLURE.",
    50,
    doc.page.height - 60,
    { align: "center", width: 495 }
  );

  doc.end();

  const buffer: Buffer = await new Promise((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="D_ALLURE-${order.trackingId}.pdf"`,
    },
  });
}
