import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { User } from "@/lib/types"
import { ObjectId } from "mongodb"

/**
 * GET /api/v1/admin/users/[id]
 * Get single user details (admin only)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const db = await getDatabase()
    const user = await db
      .collection<User>("users")
      .findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user's order count
    const orderCount = await db.collection("orders").countDocuments({
      userId: new ObjectId(id),
    })

    return NextResponse.json({
      user,
      stats: {
        totalOrders: orderCount,
      },
    })
  } catch (error) {
    console.error("Admin user fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/v1/admin/users/[id]
 * Update user (admin only) - including status for soft delete
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Don't allow password update through this endpoint
    const { password, ...updateData } = body

    // Validate status if provided
    if (updateData.status && !["active", "inactive"].includes(updateData.status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection<User>("users").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "User updated successfully" })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/admin/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const db = await getDatabase()
    const userId = new ObjectId(id)

    // Check if user has orders
    const orderCount = await db.collection("orders").countDocuments({ userId })
    if (orderCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with existing orders. Consider deactivating instead.",
          ordersCount: orderCount,
        },
        { status: 400 }
      )
    }

    // Delete user
    const result = await db.collection<User>("users").deleteOne({
      _id: userId,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Also delete user's cart
    await db.collection("carts").deleteOne({ userId })

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Admin user delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
