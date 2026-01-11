import { connectDB } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import { Order } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = verifyAdminToken(req)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()
    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminAuth = verifyAdminToken(req)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await connectDB()

    const order = await Order.findByIdAndUpdate(
      params.id,
      {
        orderStatus: status,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order, message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
