import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params

    const client = await clientPromise
    const db = client.db("printwibe")

    // Try to find by orderId first (e.g., "ORD-12345")
    let order = await db.collection("orders").findOne({
      orderId: id,
      userId: new ObjectId(decoded.userId),
    })

    // If not found and id looks like ObjectId, try finding by _id
    if (!order && ObjectId.isValid(id)) {
      order = await db.collection("orders").findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(decoded.userId),
      })
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Populate product images for order items
    const productsCollection = db.collection("products")
    const orderWithProducts = {
      ...order,
      items: await Promise.all(
        order.items.map(async (item: any) => {
          const product = await productsCollection.findOne({
            _id: new ObjectId(item.productId),
          })
          return {
            ...item,
            name: product?.name || item.name || "Product",
            productImage: product?.images?.[0] || null,
          }
        })
      ),
    }

    return NextResponse.json(orderWithProducts)
  } catch (error) {
    console.error("Order fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
