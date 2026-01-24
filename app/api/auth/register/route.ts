import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword } from "@/lib/auth"
import type { User } from "@/lib/types"
import { validateRequestBody } from "@/lib/validate"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    const validation = await validateRequestBody(registerSchema, request)
    if (!validation.success) {
      return validation.error
    }

    const { name, email, phone, password } = validation.data

    const db = await getDatabase()
    const usersCollection = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser: User = {
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "user",
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await usersCollection.insertOne(newUser)

    return NextResponse.json(
      {
        message: "User registered successfully",
        userId: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
