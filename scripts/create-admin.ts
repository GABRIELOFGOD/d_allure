/**
 * Creates (or resets the password of) the default admin account, using
 * ADMIN_EMAIL / ADMIN_PASSWORD from .env.local.
 *
 * Run with: npm run create-admin
 * Then log in at /dashboard/login and change the password from there.
 */
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../src/models/Admin";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@dallure.com";
  const password = process.env.ADMIN_PASSWORD || "changeme123";

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env.local");

  await mongoose.connect(uri);

  const hashed = await bcrypt.hash(password, 10);
  const existing = await Admin.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.password = hashed;
    await existing.save();
    console.log(`Updated existing admin password for ${email}`);
  } else {
    await Admin.create({ email: email.toLowerCase(), password: hashed, name: "Admin" });
    console.log(`Created admin account: ${email}`);
  }

  console.log(`Login at /dashboard/login with:\n  email: ${email}\n  password: ${password}`);
  console.log("Please change this password after your first login.");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
