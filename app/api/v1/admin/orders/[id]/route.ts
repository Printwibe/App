import { connectDB, getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import { Order } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import type { Product, Order as OrderType } from "@/lib/types"
import { ObjectId } from "mongodb"

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
const validPaymentStatuses = ["pending", "paid", "failed"]

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await connectDB()
    const order = await Order.findById(id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = req.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { status, paymentStatus } = body

    const { id } = await params

    await connectDB()
    const db = await getDatabase()

    // Get the current order first
    const currentOrder = await db.collection<OrderType>("orders").findOne({ _id: new ObjectId(id) })
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    // Handle order status changes with inventory management
    if (status && status !== currentOrder.orderStatus) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
      }

      const oldStatus = currentOrder.orderStatus
      updateData.orderStatus = status
      
      // Auto-update payment status to paid when order is delivered
      if (status === "delivered") {
        updateData.paymentStatus = "paid"
      }

      // Handle inventory changes based on status transitions
      const productsCollection = db.collection<Product>("products")

      // If order is being cancelled, restore inventory
      if (status === "cancelled" && ["confirmed", "processing", "shipped"].includes(oldStatus)) {
        for (const item of currentOrder.items) {
          await productsCollection.updateOne(
            {
              _id: item.productId,
              "variants.size": item.variant.size,
              "variants.color": item.variant.color,
            },
            {
              $inc: { "variants.$.stock": item.quantity },
              $set: { updatedAt: new Date() },
            }
          )
        }
      }
    }

    // Handle payment status changes
    if (paymentStatus && paymentStatus !== currentOrder.paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json({ error: "Invalid payment status" }, { status: 400 })
      }

      const oldPaymentStatus = currentOrder.paymentStatus
      updateData.paymentStatus = paymentStatus

      // If payment failed and order isn't cancelled, cancel order and restore inventory
      if (paymentStatus === "failed" && currentOrder.orderStatus !== "cancelled") {
        updateData.orderStatus = "cancelled"
        
        const productsCollection = db.collection<Product>("products")
        for (const item of currentOrder.items) {
          await productsCollection.updateOne(
            {
              _id: item.productId,
              "variants.size": item.variant.size,
              "variants.color": item.variant.color,
            },
            {
              $inc: { "variants.$.stock": item.quantity },
              $set: { updatedAt: new Date() },
            }
          )
        }
      }
    }

    if (Object.keys(updateData).length === 1) {
      return NextResponse.json({ error: "No valid update fields provided" }, { status: 400 })
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after" },
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
