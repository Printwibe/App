import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { Cart, CartItem } from "@/lib/models/types"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const cart = await db.collection<Cart>("carts").findOne({ userId: user._id })

    return NextResponse.json({ cart: cart || { items: [] } })
  } catch (error) {
    console.error("Cart fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { productId, variant, quantity, isCustomized, customDesignId, unitPrice, customizationFee } = body

    const db = await getDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    const productObjectId = new ObjectId(productId)

    const newItem: CartItem = {
      productId: productObjectId,
      variant,
      quantity,
      isCustomized: isCustomized || false,
      customDesignId: customDesignId ? new ObjectId(customDesignId) : undefined,
      unitPrice: unitPrice || 0,
      customizationFee: customizationFee || 0,
    }

    const existingCart = await cartsCollection.findOne({ userId: user._id })

    if (existingCart) {
      const existingItemIndex = existingCart.items.findIndex(
        (item) =>
          item.productId.toString() === productObjectId.toString() &&
          item.variant.size === variant.size &&
          item.variant.color === variant.color &&
          item.isCustomized === isCustomized,
      )

      if (existingItemIndex > -1 && !isCustomized) {
        await cartsCollection.updateOne(
          { userId: user._id },
          {
            $inc: { [`items.${existingItemIndex}.quantity`]: quantity },
            $set: { updatedAt: new Date() },
          },
        )
      } else {
        await cartsCollection.updateOne(
          { userId: user._id },
          {
            $push: { items: newItem },
            $set: { updatedAt: new Date() },
          },
        )
      }
    } else {
      await cartsCollection.insertOne({
        userId: user._id!,
        items: [newItem],
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ message: "Item added to cart", success: true })
  } catch (error) {
    console.error("Cart add error:", error)
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { itemIndex, quantity } = body

    const db = await getDatabase()

    if (quantity <= 0) {
      await db.collection<Cart>("carts").updateOne(
        { userId: user._id },
        {
          $unset: { [`items.${itemIndex}`]: 1 },
          $set: { updatedAt: new Date() },
        },
      )
      await db
        .collection<Cart>("carts")
        .updateOne({ userId: user._id }, { $pull: { items: null as unknown as CartItem } })
    } else {
      await db.collection<Cart>("carts").updateOne(
        { userId: user._id },
        {
          $set: {
            [`items.${itemIndex}.quantity`]: quantity,
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({ message: "Cart updated" })
  } catch (error) {
    console.error("Cart update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemIndex = searchParams.get("itemIndex")

    const db = await getDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    if (itemIndex !== null) {
      const cart = await cartsCollection.findOne({ userId: user._id })
      if (cart) {
        const newItems = cart.items.filter((_, i) => i !== Number.parseInt(itemIndex))
        await cartsCollection.updateOne({ userId: user._id }, { $set: { items: newItems, updatedAt: new Date() } })
      }
    } else {
      await cartsCollection.deleteOne({ userId: user._id })
    }

    return NextResponse.json({ message: "Cart updated" })
  } catch (error) {
    console.error("Cart delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
