import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { Product } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    // Verify admin token from cookie
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")
    
    // Get total count
    const total = await productsCollection.countDocuments({})
    
    // Get products
    const products = await productsCollection.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ 
      products,
      pagination: {
        total,
        page: 1,
        limit: total,
        pages: 1
      }
    })
  } catch (error) {
    console.error("Admin products fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin token from cookie
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      slug,
      description,
      category,
      basePrice,
      customizationPrice,
      variants,
      images,
      allowCustomization,
      isActive,
    } = body

    if (!name || !slug || !category || basePrice === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")

    // Check if slug already exists
    const existingProduct = await productsCollection.findOne({ slug })
    if (existingProduct) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 400 })
    }

    const newProduct: Product = {
      name,
      slug,
      description: description || "",
      category,
      basePrice,
      customizationPrice: customizationPrice || 0,
      images: images || [],
      variants: variants || [],
      allowCustomization: allowCustomization ?? true,
      isActive: isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await productsCollection.insertOne(newProduct)

    return NextResponse.json(
      {
        message: "Product created successfully",
        productId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Admin product create error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
