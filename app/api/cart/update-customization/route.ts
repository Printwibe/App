import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { Cart } from "@/lib/types"

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { itemIndex, customizationData } = body

    if (typeof itemIndex !== 'number' || !customizationData) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const db = await getDatabase()
    const cartsCollection = db.collection<Cart>("carts")

    // Update customization data for specific cart item
    await cartsCollection.updateOne(
      { userId: user._id },
      {
        $set: {
          [`items.${itemIndex}.customizationData`]: customizationData,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Customization updated successfully" })
  } catch (error) {
    console.error("Cart customization update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
