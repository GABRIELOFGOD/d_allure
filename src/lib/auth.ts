import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
export const ADMIN_COOKIE = "d_allure_admin_token";

export interface AdminTokenPayload {
  id: string;
  email: string;
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

/** Use inside API route handlers to require a valid admin session. */
export function requireAdmin(req: NextRequest): AdminTokenPayload | null {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
