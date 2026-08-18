import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginPage = pathname === "/dashboard/login";

  if (isDashboardRoute && !isLoginPage) {
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const payload = token ? verifyAdminToken(token) : null;

    if (!payload) {
      const loginUrl = new URL("/dashboard/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
