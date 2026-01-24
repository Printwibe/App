import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { Notifications } from "@/lib/models/notifications"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    
    // Find the order
    const order = await db.collection("orders").findOne({
      orderId: id,
      userId: new ObjectId(user._id)
    })
    
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Check if order can be cancelled
    // Orders can only be cancelled if status is "pending" or "confirmed"
    const cancellableStatuses = ["pending", "confirmed"]
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return NextResponse.json({ 
        error: "This order cannot be cancelled as it is already in processing or beyond" 
      }, { status: 400 })
    }

    // Update order status to cancelled
    const result = await db.collection("orders").updateOne(
      { orderId: id, userId: new ObjectId(user._id) },
      {
        $set: {
          orderStatus: "cancelled",
          updatedAt: new Date()
        }
      }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
    }

    // Create notification for cancelled order
    await Notifications.create({
      type: "order_cancelled",
      title: "Order Cancelled",
      message: `Order ${id} has been cancelled by customer. Total: ₹${order.total.toFixed(2)}`,
      orderId: order._id.toString(),
      orderNumber: id,
      isRead: false
    })

    // Restore inventory if order was confirmed
    if (order.orderStatus === "confirmed") {
      const productsCollection = db.collection("products")
      
      for (const item of order.items) {
        await productsCollection.updateOne(
          {
            _id: new ObjectId(item.productId),
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

    return NextResponse.json({ 
      success: true, 
      message: "Order cancelled successfully" 
    })
  } catch (error) {
    console.error("Cancel order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
