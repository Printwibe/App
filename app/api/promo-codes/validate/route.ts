import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { PromoCode } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, orderValue } = body

    if (!code || !orderValue) {
      return NextResponse.json({ error: "Code and order value are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const promoCode = await db.collection<PromoCode>("promoCodes").findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    })

    if (!promoCode) {
      return NextResponse.json({ error: "Invalid promo code" }, { status: 404 })
    }

    // Check if code is valid (date range)
    const now = new Date()
    if (now < new Date(promoCode.validFrom) || now > new Date(promoCode.validUntil)) {
      return NextResponse.json({ error: "This promo code has expired or is not yet valid" }, { status: 400 })
    }

    // Check if usage limit exceeded
    if (promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 })
    }

    // Check minimum order value
    if (orderValue < promoCode.minOrderValue) {
      return NextResponse.json({ 
        error: `Minimum order value of ₹${promoCode.minOrderValue} required` 
      }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (promoCode.discountType === "percentage") {
      discount = (orderValue * promoCode.discountValue) / 100
      // Apply max discount if set
      if (promoCode.maxDiscount && promoCode.maxDiscount > 0 && discount > promoCode.maxDiscount) {
        discount = promoCode.maxDiscount
      }
    } else {
      discount = promoCode.discountValue
    }

    // Ensure discount doesn't exceed order value
    if (discount > orderValue) {
      discount = orderValue
    }

    return NextResponse.json({
      valid: true,
      discount: Number(discount.toFixed(2)),
      code: promoCode.code,
      description: promoCode.description,
    })
  } catch (error) {
    console.error("Promo code validation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
