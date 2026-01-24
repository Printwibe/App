import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!user.password) {
      return NextResponse.json({ error: "Invalid password state" }, { status: 400 })
    }

    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(newPassword)

    const db = await getDatabase()
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      },
    )

    return NextResponse.json({ message: "Password updated successfully" })
  } catch (error) {
    console.error("Password update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
