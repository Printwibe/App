import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"
import type { LegalPage } from "@/lib/types"

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
    const legalPages = await db.collection<LegalPage>("legalPages").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ legalPages })
  } catch (error) {
    console.error("Admin legal pages fetch error:", error)
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
    const { type, title, content } = body

    if (!type || !title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (type !== "terms" && type !== "privacy") {
      return NextResponse.json({ error: "Invalid type. Must be 'terms' or 'privacy'" }, { status: 400 })
    }

    const db = await getDatabase()
    const legalPagesCollection = db.collection<LegalPage>("legalPages")

    // Check if page of this type already exists
    const existingPage = await legalPagesCollection.findOne({ type })

    if (existingPage) {
      // Update existing page
      const version = (existingPage.version || 1) + 1
      const result = await legalPagesCollection.findOneAndUpdate(
        { type },
        {
          $set: {
            title,
            content,
            version,
            isActive: true,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      )

      return NextResponse.json({
        message: "Legal page updated successfully",
        legalPage: result,
      })
    } else {
      // Create new page
      const newLegalPage: LegalPage = {
        type,
        title,
        content,
        version: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await legalPagesCollection.insertOne(newLegalPage)
      return NextResponse.json(
        {
          message: "Legal page created successfully",
          legalPage: { ...newLegalPage, _id: result.insertedId },
        },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error("Admin legal page create/update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { type, title, content, isActive } = body

    if (!type) {
      return NextResponse.json({ error: "Type is required" }, { status: 400 })
    }

    if (type !== "terms" && type !== "privacy") {
      return NextResponse.json({ error: "Invalid type. Must be 'terms' or 'privacy'" }, { status: 400 })
    }

    const db = await getDatabase()
    const legalPagesCollection = db.collection<LegalPage>("legalPages")

    const existingPage = await legalPagesCollection.findOne({ type })
    if (!existingPage) {
      return NextResponse.json({ error: "Legal page not found" }, { status: 404 })
    }

    const updateData: Partial<LegalPage> = {
      updatedAt: new Date(),
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) {
      updateData.content = content
      updateData.version = (existingPage.version || 1) + 1
    }
    if (isActive !== undefined) updateData.isActive = isActive

    const result = await legalPagesCollection.findOneAndUpdate(
      { type },
      { $set: updateData },
      { returnDocument: "after" }
    )

    return NextResponse.json({
      message: "Legal page updated successfully",
      legalPage: result,
    })
  } catch (error) {
    console.error("Admin legal page update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
