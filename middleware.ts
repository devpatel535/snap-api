import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  if (!isDashboard) return NextResponse.next()

  // NextAuth v5 sets one of these cookies when logged in
  const sessionToken =
    req.cookies.get("authjs.session-token") ??
    req.cookies.get("__Secure-authjs.session-token")

  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
