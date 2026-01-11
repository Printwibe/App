import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { Order, Cart } from "@/lib/models/types"

function generateOrderId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")
  return `PW-${year}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethod, shippingInfo, razorpayPaymentId, razorpayOrderId } = body

    const db = await getDatabase()

    // Get user's cart
    const cart = await db.collection<Cart>("carts").findOne({ userId: user._id })
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice + item.customizationFee) * item.quantity, 0)
    const shipping = 0 // Free shipping
    const total = subtotal + shipping

    // Create order
    const orderId = generateOrderId()
    const order: Order = {
      orderId,
      userId: user._id!,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: "", // Would be populated from product lookup
        variant: item.variant,
        quantity: item.quantity,
        isCustomized: item.isCustomized,
        customDesign: item.customDesignId
          ? {
              designId: item.customDesignId,
              fileUrl: "", // Would be populated from design lookup
              fileName: "",
              printArea: { x: 0, y: 0, width: 0, height: 0 },
            }
          : undefined,
        unitPrice: item.unitPrice,
        customizationFee: item.customizationFee,
        itemTotal: (item.unitPrice + item.customizationFee) * item.quantity,
      })),
      shippingAddress: {
        type: "home",
        house: shippingInfo.house,
        street: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.postalCode,
        country: shippingInfo.country,
        isDefault: false,
      },
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      razorpayOrderId,
      razorpayPaymentId,
      orderStatus: "confirmed",
      subtotal,
      shipping,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection<Order>("orders").insertOne(order)

    // Clear cart
    await db.collection<Cart>("carts").deleteOne({ userId: user._id })

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(user.email, order)

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const orders = await db.collection<Order>("orders").find({ userId: user._id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
