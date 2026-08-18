# D_ALLURE

Personalized perfume oil e-commerce site. Next.js 16 (App Router), MongoDB, Cloudinary, JWT admin auth, Nodemailer/Gmail, WhatsApp checkout.

## 1. Install dependencies

```
npm install
```

## 2. Environment variables

Everything is in `.env.local` already, with your MongoDB URI and WhatsApp number filled in. You still need to fill in:

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — from your Cloudinary dashboard.
- `GMAIL_USER`, `GMAIL_APP_PASSWORD` — a Gmail address and a Google **App Password** (not your normal Gmail password — generate one at https://myaccount.google.com/apppasswords with 2FA enabled).
- `JWT_SECRET` — replace with any long random string.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the default admin login created by the seed script below. Change the password from the dashboard after your first login.
- `NEXT_PUBLIC_SITE_URL` — set to your real domain once deployed (used in emails).

`WHATSAPP_NUMBER` / `NEXT_PUBLIC_WHATSAPP_NUMBER` are already set to +2349039194587 — change both in `.env.local` any time.

## 3. Create the admin account

```
npm run create-admin
```

This reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local` and creates (or resets) that admin. Log in at `/dashboard/login`, then change the password from there if you'd like.

## 4. Run locally

```
npm run dev
```

Storefront: http://localhost:3000
Admin dashboard: http://localhost:3000/dashboard/login

## 5. Deploy

Any Node host works (Vercel, DigitalOcean App Platform, etc.). Set the same environment variables there, and make sure your MongoDB Atlas cluster's Network Access allows connections from your host (Atlas → Network Access → Add IP Address → Allow Access from Anywhere, or your host's static IPs).

## What's built

- **Storefront**: futuristic landing page with the Spline 3D hero, live announcement marquee, shop grid with category filters, product detail pages (image/video gallery, customizable name field with a remembered/auto-filled name via localStorage, verified-buyer reviews), cart (localStorage-based, no accounts), checkout modal (name/email/phone/address/note, coupon codes), order confirmation with tracking ID + "Continue on WhatsApp" handoff, and a public order tracking page with a downloadable PDF receipt (available once an order is delivered or cancelled).
- **Admin dashboard** (`/dashboard`, JWT-protected via `src/proxy.ts`): overview with revenue/order charts and a CSV export, products (with Cloudinary image/video upload, discount toggle with random-or-manual %, customizable toggle), categories, orders (status changes trigger customer emails, receipt download at any status), coupons, announcements (marquee content), review moderation, customers (auto-collected from orders, deduped by email), and a newsletter composer (all subscribers / single / custom selection).
- **Emails** (Nodemailer + Gmail): order confirmation, order status change, newsletter — all using a shared branded HTML template.

## Notes

- No customer login/signup exists anywhere by design — carts live in `localStorage`, and orders are tracked by a generated tracking ID (e.g. `DA-7F3K2Q`) rather than an account.
- Product discounts: toggle "Apply Discount" on a product and either set a percent or leave it blank for a random 5–40% discount.
- Reviews require the buyer's order tracking ID and confirm the product was actually in that order before allowing a review; new reviews are hidden until approved in the dashboard.
