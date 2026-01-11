import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const admin = await getCurrentAdmin()

    if (!admin) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        status: admin.status,
      },
    })
  } catch (error) {
    console.error("Error fetching admin:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
