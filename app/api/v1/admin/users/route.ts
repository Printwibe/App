import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { User } from "@/lib/types"

/**
 * GET /api/v1/admin/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    const role = searchParams.get("role") // Filter by role

    const skip = (page - 1) * limit

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Build filter
    const filter: Record<string, unknown> = {}
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ]
    }

    if (role) {
      filter.role = role
    }

    // Get total count
    const total = await usersCollection.countDocuments(filter)

    // Get users (exclude password)
    const users = await usersCollection
      .find(filter)
      .project({ password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
