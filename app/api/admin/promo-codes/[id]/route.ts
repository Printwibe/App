import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentAdmin } from "@/lib/auth"
import type { PromoCode } from "@/lib/types"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      validFrom,
      validUntil,
      usageLimit,
      isActive,
    } = body

    const db = await getDatabase()

    // Check if code is being changed and if new code already exists
    const existingCode = await db.collection<PromoCode>("promoCodes").findOne({
      code: code.toUpperCase(),
      _id: { $ne: new ObjectId(id) },
    })
    if (existingCode) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 })
    }

    await db
      .collection<PromoCode>("promoCodes")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            code: code.toUpperCase(),
            description: description || "",
            discountType,
            discountValue: Number(discountValue),
            minOrderValue: Number(minOrderValue),
            maxDiscount: discountType === "percentage" ? Number(maxDiscount) || undefined : undefined,
            validFrom: new Date(validFrom),
            validUntil: new Date(validUntil),
            usageLimit: Number(usageLimit),
            isActive: isActive !== false,
            updatedAt: new Date(),
          },
        }
      )

    return NextResponse.json({ message: "Promo code updated successfully" })
  } catch (error) {
    console.error("Promo code update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const db = await getDatabase()
    await db.collection<PromoCode>("promoCodes").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ message: "Promo code deleted successfully" })
  } catch (error) {
    console.error("Promo code deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
