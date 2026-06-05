import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isDashboard && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
