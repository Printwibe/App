import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { CustomDesign } from "@/lib/models/types"
import { put } from "@vercel/blob"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const productId = formData.get("productId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PNG, JPG, and SVG files are allowed.",
        },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "File too large. Maximum size is 5MB.",
        },
        { status: 400 },
      )
    }

    // Upload to Vercel Blob
    const blob = await put(`designs/${user._id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Get image dimensions (for preview positioning)
    // In production, you'd use sharp or similar to get actual dimensions
    const dimensions = { width: 500, height: 500 }

    // Save to database
    const db = await getDatabase()
    const designsCollection = db.collection<CustomDesign>("customDesigns")

    const newDesign: CustomDesign = {
      userId: user._id!,
      productId: new ObjectId(productId),
      fileName: file.name,
      fileUrl: blob.url,
      fileType: file.type,
      fileSize: file.size,
      dimensions,
      printArea: {
        x: 50,
        y: 50,
        width: 200,
        height: 200,
      },
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await designsCollection.insertOne(newDesign)

    return NextResponse.json({
      message: "Design uploaded successfully",
      design: {
        id: result.insertedId,
        fileUrl: blob.url,
        fileName: file.name,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
