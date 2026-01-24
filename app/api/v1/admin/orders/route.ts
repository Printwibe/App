import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { Order } from "@/lib/types"

/**
 * GET /api/v1/admin/orders
 * Get all orders from all users (admin only)
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
    const status = searchParams.get("status") // Filter by order status
    const paymentStatus = searchParams.get("paymentStatus")
    const search = searchParams.get("search") // Search by order ID or user email
    const userId = searchParams.get("userId") // Filter by specific user

    const skip = (page - 1) * limit

    const db = await getDatabase()
    const ordersCollection = db.collection<Order>("orders")

    // Build filter
    const filter: Record<string, unknown> = {}

    if (userId) {
      const { ObjectId } = await import("mongodb")
      try {
        filter.userId = new ObjectId(userId)
      } catch (error) {
        return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 })
      }
    }

    if (status) {
      filter.orderStatus = status
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.email": { $regex: search, $options: "i" } },
      ]
    }

    // Get total count
    const total = await ordersCollection.countDocuments(filter)

    // Get orders with user details and product information
    const orders = await ordersCollection
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "user.password": 0,
          },
        },
      ])
      .toArray()

    // Populate product names and images for each order
    const { ObjectId } = await import("mongodb")
    const productsCollection = db.collection("products")
    
    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const product = await productsCollection.findOne({
            _id: new ObjectId(item.productId),
          })
          if (product) {
            item.name = product.name || item.name || "Product"
            item.productImage = product.images?.[0] || null
          }
        }
      }
    }

    // Calculate stats
    const stats = await ordersCollection
      .aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "pending"] }, 1, 0] },
            },
            confirmedOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "confirmed"] }, 1, 0] },
            },
            processingOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "processing"] }, 1, 0] },
            },
            shippedOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "shipped"] }, 1, 0] },
            },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0] },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        confirmedOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
      },
    })
  } catch (error) {
    console.error("Admin orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
