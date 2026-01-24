import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentAdmin } from "@/lib/auth"
import type { PromoCode } from "@/lib/types"

export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const promoCodes = await db
      .collection<PromoCode>("promoCodes")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(
      promoCodes.map((code) => ({
        ...code,
        _id: code._id?.toString(),
      }))
    )
  } catch (error) {
    console.error("Promo codes fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    // Validate code is unique
    const db = await getDatabase()
    const existingCode = await db.collection<PromoCode>("promoCodes").findOne({ code: code.toUpperCase() })
    if (existingCode) {
      return NextResponse.json({ error: "Promo code already exists" }, { status: 400 })
    }

    const newPromoCode: PromoCode = {
      code: code.toUpperCase(),
      description: description || "",
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: discountType === "percentage" ? Number(maxDiscount) || undefined : undefined,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: Number(usageLimit),
      usedCount: 0,
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection<PromoCode>("promoCodes").insertOne(newPromoCode)

    return NextResponse.json({
      message: "Promo code created successfully",
      id: result.insertedId,
    })
  } catch (error) {
    console.error("Promo code creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
