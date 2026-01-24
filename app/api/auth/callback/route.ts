import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/next-auth"
import { getDatabase } from "@/lib/mongodb"
import { generateToken } from "@/lib/auth"
import { cookies } from "next/headers"
import type { User } from "@/lib/types"

/**
 * OAuth Callback Handler
 * Sets JWT cookie after successful OAuth login
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get user from database
    const db = await getDatabase()
    const user = await db.collection<User>("users").findOne({
      email: session.user.email.toLowerCase()
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate JWT token
    const token = generateToken(user._id.toString(), user.role || "user")

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("OAuth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=callback_error", request.url))
  }
}
