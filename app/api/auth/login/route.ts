import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/types"
import { cookies } from "next/headers"
import { validateRequestBody } from "@/lib/validate"
import { loginSchema } from "@/lib/validations"
import { checkRateLimit, getIdentifier, rateLimits, getRateLimitHeaders } from "@/lib/rate-limit"
import { logError, logWarning } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getIdentifier(request)
    const rateLimit = checkRateLimit(identifier, rateLimits.auth)
    
    if (!rateLimit.allowed) {
      logWarning("Rate limit exceeded for login", { identifier })
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetTime),
        }
      )
    }

    // Validate request body
    const validation = await validateRequestBody(loginSchema, request)
    if (!validation.success) {
      return validation.error
    }

    const { email, password } = validation.data

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Find user by email
    const user = await usersCollection.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if user has a password (not OAuth user)
    if (!user.password) {
      return NextResponse.json({ error: "This account uses social login. Please sign in with your social account." }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken(user._id!.toString(), user.role)

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    logError(error, { endpoint: "/api/auth/login" })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
