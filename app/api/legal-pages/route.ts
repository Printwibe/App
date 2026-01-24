import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { LegalPage } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const db = await getDatabase()
    const legalPagesCollection = db.collection<LegalPage>("legalPages")

    if (type) {
      // Fetch specific legal page by type
      if (type !== "terms" && type !== "privacy") {
        return NextResponse.json({ error: "Invalid type. Must be 'terms' or 'privacy'" }, { status: 400 })
      }

      const legalPage = await legalPagesCollection.findOne({ type, isActive: true })

      if (!legalPage) {
        return NextResponse.json({ error: "Legal page not found" }, { status: 404 })
      }

      return NextResponse.json({ legalPage })
    } else {
      // Fetch all active legal pages
      const legalPages = await legalPagesCollection.find({ isActive: true }).sort({ createdAt: -1 }).toArray()

      return NextResponse.json({ legalPages })
    }
  } catch (error) {
    console.error("Legal pages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
