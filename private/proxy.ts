import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE, safeEqual, sessionToken } from "@/lib/auth";

// With DASHBOARD_PASSWORD unset the dashboard stays open (local development). Set it on Vercel.
export async function proxy(request: NextRequest) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname === "/api/login") return NextResponse.next();

  const cookie = request.cookies.get(COOKIE)?.value ?? "";
  if (cookie && safeEqual(cookie, await sessionToken(password))) return NextResponse.next();

  if (pathname.startsWith("/api/")) return Response.json({ error: "Sign in required." }, { status: 401 });
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
