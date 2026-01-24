import { type NextRequest, NextResponse } from "next/server"
import { verifyAdminToken } from "@/lib/auth"
import { del } from "@vercel/blob"

export async function DELETE(request: NextRequest) {
  try {
    // Verify Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Storage not configured" },
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

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    // Only delete if it's a Vercel Blob URL
    if (!url.includes('blob.vercel-storage.com') && !url.includes('public.blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: "Can only delete Vercel Blob URLs" },
        { status: 400 },
      )
    }

    // Delete from Vercel Blob
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })

    return NextResponse.json({
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Admin image delete error:", error)
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { error: `Delete failed: ${errorMessage}` },
      { status: 500 },
    )
  }
}
