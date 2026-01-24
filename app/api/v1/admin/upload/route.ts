import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    // Verify Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN is not configured")
      return NextResponse.json(
        { error: "Storage not configured. Please add BLOB_READ_WRITE_TOKEN to your .env file." },
        { status: 500 },
      )
    }

    // Verify admin token
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only PNG, JPG, and WEBP files are allowed.",
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
    const blob = await put(`products/${Date.now()}-${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return NextResponse.json({
      url: blob.url,
      fileName: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Admin upload error:", error)
    
    // Provide more specific error message
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 },
    )
  }
}
