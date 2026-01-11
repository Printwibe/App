import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userToken = request.cookies.get("auth-token")?.value
  const adminToken = request.cookies.get("admin-token")?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/v1/admin")) {
    // Allow access to admin login page without token
    if (pathname === "/v1/admin/login") {
      // If already logged in as admin, redirect to dashboard
      if (adminToken) {
        return NextResponse.redirect(new URL("/v1/admin", request.url))
      }
      return NextResponse.next()
    }

    // All other admin routes require admin token
    if (!adminToken) {
      return NextResponse.redirect(new URL("/v1/admin/login", request.url))
    }
  }

  // Protected user routes
  const protectedRoutes = ["/profile", "/checkout"]
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Redirect logged in users away from auth pages
  if ((pathname === "/login" || pathname === "/register") && userToken) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/v1/admin/:path*", "/profile/:path*", "/checkout/:path*", "/login", "/register"],
}
