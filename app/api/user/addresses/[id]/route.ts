import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, house, street, city, state, postalCode, country, isDefault } = body

    const client = await clientPromise
    const db = client.db("printwibe")

    // If setting as default, unset other defaults first
    if (isDefault) {
      await db
        .collection("users")
        .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { "addresses.$[].isDefault": false } })
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId), "addresses._id": new ObjectId(id) },
      {
        $set: {
          "addresses.$.type": type,
          "addresses.$.house": house,
          "addresses.$.street": street,
          "addresses.$.city": city,
          "addresses.$.state": state,
          "addresses.$.postalCode": postalCode,
          "addresses.$.country": country,
          "addresses.$.isDefault": isDefault,
        },
      },
    )

    return NextResponse.json({ message: "Address updated" })
  } catch (error) {
    console.error("Address update error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id } = await params

    const client = await clientPromise
    const db = client.db("printwibe")

    await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $pull: { addresses: { _id: new ObjectId(id) } } as any })

    return NextResponse.json({ message: "Address deleted" })
  } catch (error) {
    console.error("Address delete error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
