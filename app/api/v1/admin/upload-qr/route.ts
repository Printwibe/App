import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

// Upload QR Code Image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 })
    }

    // Upload to Vercel Blob
    const blob = await put(`payment/qr-codes/${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      message: "QR code uploaded successfully"
    })
  } catch (error) {
    console.error("QR code upload error:", error)
    return NextResponse.json({ error: "Failed to upload QR code" }, { status: 500 })
  }
}
