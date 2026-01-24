import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { Product } from "@/lib/types"
import { ObjectId } from "mongodb"
import { del } from "@vercel/blob"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    const product = await db.collection<Product>("products").findOne({
      _id: new ObjectId(id),
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Admin product fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const db = await getDatabase()
    
    // Get existing product to compare images
    const existingProduct = await db.collection<Product>("products").findOne({
      _id: new ObjectId(id),
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Update the product
    const result = await db.collection<Product>("products").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
    )

    // Find and delete removed images from Vercel Blob
    if (existingProduct.images && body.images && process.env.BLOB_READ_WRITE_TOKEN) {
      const removedImages = existingProduct.images.filter(
        (oldUrl: string) => !body.images.includes(oldUrl)
      )
      
      const blobUrls = removedImages.filter((url: string) => 
        url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
      )
      
      if (blobUrls.length > 0) {
        try {
          await Promise.all(
            blobUrls.map((url: string) => 
              del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
            )
          )
          console.log(`✓ Deleted ${blobUrls.length} removed images from Vercel Blob`)
        } catch (blobError) {
          console.error("Warning: Failed to delete some images from Vercel Blob:", blobError)
        }
      }
    }

    return NextResponse.json({ message: "Product updated successfully" })
  } catch (error) {
    console.error("Admin product update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    
    // First, get the product to retrieve image URLs
    const product = await db.collection<Product>("products").findOne({
      _id: new ObjectId(id),
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete the product from database
    const result = await db.collection<Product>("products").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Delete images from Vercel Blob (only if they are Vercel Blob URLs)
    if (product.images && product.images.length > 0 && process.env.BLOB_READ_WRITE_TOKEN) {
      const blobUrls = product.images.filter(url => 
        url.includes('blob.vercel-storage.com') || url.includes('public.blob.vercel-storage.com')
      )
      
      if (blobUrls.length > 0) {
        try {
          await Promise.all(
            blobUrls.map(url => 
              del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
            )
          )
          console.log(`✓ Deleted ${blobUrls.length} images from Vercel Blob`)
        } catch (blobError) {
          // Log error but don't fail the product deletion
          console.error("Warning: Failed to delete some images from Vercel Blob:", blobError)
        }
      }
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Admin product delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
