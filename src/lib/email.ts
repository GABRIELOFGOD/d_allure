import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

const BRAND = {
  name: "D_ALLURE",
  motto: "Smell expensive, stay unforgettable",
  burgundy: "#5c0a1f",
  beige: "#efe6d8",
};

function wrapper(title: string, body: string) {
  return `
  <div style="background:${BRAND.beige};padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4d9c6;">
      <div style="background:${BRAND.burgundy};padding:24px;text-align:center;">
        <h1 style="color:${BRAND.beige};letter-spacing:4px;font-size:20px;margin:0;">D_ALLURE</h1>
        <p style="color:#d8bfc9;font-size:11px;letter-spacing:2px;margin:4px 0 0;text-transform:uppercase;">${BRAND.motto}</p>
      </div>
      <div style="padding:28px 24px;color:#2a2a2a;">
        <h2 style="font-size:18px;margin-top:0;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 24px;background:${BRAND.beige};text-align:center;font-size:11px;color:#7a6f5c;">
        &copy; ${new Date().getFullYear()} D_ALLURE. All rights reserved.
      </div>
    </div>
  </div>`;
}

export async function sendMail(to: string, subject: string, html: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not set — skipping email send:", subject);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
    to,
    subject,
    html,
  });
}

export async function sendOrderConfirmationEmail(opts: {
  to: string;
  name: string;
  trackingId: string;
  total: string;
}) {
  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${opts.trackingId}`;
  const html = wrapper(
    "Your order has been received",
    `<p>Hi ${opts.name},</p>
     <p>Thank you for your order. Your tracking ID is:</p>
     <p style="font-size:20px;letter-spacing:2px;font-weight:bold;background:${BRAND.beige};padding:10px 14px;text-align:center;">${opts.trackingId}</p>
     <p>Order total: <strong>${opts.total}</strong></p>
     <p>Track your order or complete payment on WhatsApp using the link below:</p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${trackUrl}" style="background:${BRAND.burgundy};color:#fff;padding:12px 24px;text-decoration:none;letter-spacing:1px;">Track Order</a>
     </p>`
  );
  await sendMail(opts.to, `D_ALLURE — Order Received (${opts.trackingId})`, html);
}

export async function sendOrderStatusEmail(opts: {
  to: string;
  name: string;
  trackingId: string;
  status: string;
}) {
  const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/track?id=${opts.trackingId}`;
  const html = wrapper(
    "Your order status has been updated",
    `<p>Hi ${opts.name},</p>
     <p>Your order <strong>${opts.trackingId}</strong> is now: <strong style="text-transform:capitalize;">${opts.status}</strong></p>
     <p style="text-align:center;margin:24px 0;">
       <a href="${trackUrl}" style="background:${BRAND.burgundy};color:#fff;padding:12px 24px;text-decoration:none;letter-spacing:1px;">View Order</a>
     </p>`
  );
  await sendMail(opts.to, `D_ALLURE — Order ${opts.status} (${opts.trackingId})`, html);
}

export async function sendNewsletterEmail(opts: { to: string; subject: string; message: string }) {
  const html = wrapper(opts.subject, `<div>${opts.message}</div>`);
  await sendMail(opts.to, opts.subject, html);
}
