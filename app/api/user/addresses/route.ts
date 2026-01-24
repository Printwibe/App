import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db("printwibe")

    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    })

    return NextResponse.json(user?.addresses || [])
  } catch (error) {
    console.error("Addresses fetch error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { type, house, street, city, state, postalCode, country, isDefault } = body

    const client = await clientPromise
    const db = client.db("printwibe")

    const addressId = new ObjectId()
    const newAddress = {
      _id: addressId,
      type,
      house,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault: isDefault || false,
    }

    // If setting as default, unset other defaults first
    if (isDefault) {
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { "addresses.$[].isDefault": false } })
    }

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $push: { addresses: newAddress } as any })

    return NextResponse.json({ message: "Address added", address: newAddress })
  } catch (error) {
    console.error("Address add error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
