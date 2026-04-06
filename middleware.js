import { NextResponse } from "next/server";

const PUBLIC = ["/auth/signin", "/api/auth/verify"];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Let public paths through
  if (PUBLIC.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check cookie
  const auth = request.cookies.get("app-auth")?.value;
  if (auth !== "true") {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
