import { NextRequest, NextResponse } from "next/server"

const PRODUCTION_URL = "https://snapapi.vercel.app"
const ALLOWED_HOSTS = ["snapapi.vercel.app", "snap-api-tawny.vercel.app"]

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? ""

  // Redirect any preview/branch Vercel URL to production
  if (!ALLOWED_HOSTS.includes(host) && host.endsWith(".vercel.app")) {
    const url = `${PRODUCTION_URL}${req.nextUrl.pathname}${req.nextUrl.search}`
    return NextResponse.redirect(url, { status: 308 })
  }

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const sessionToken =
      req.cookies.get("authjs.session-token") ??
      req.cookies.get("__Secure-authjs.session-token")

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", PRODUCTION_URL))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
