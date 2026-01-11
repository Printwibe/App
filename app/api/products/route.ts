import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const customizable = searchParams.get("customizable")
    const search = searchParams.get("search")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Build query
    const query: Record<string, unknown> = { isActive: true }

    if (category) {
      query.category = category
    }

    if (customizable === "true") {
      query.allowCustomization = true
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }]
    }

    const skip = (page - 1) * limit

    const [products, total] = await Promise.all([
      productsCollection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      productsCollection.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
