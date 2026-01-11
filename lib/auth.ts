import { getDatabase } from "./mongodb"
import type { User } from "./models/types"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-this"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string }
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const decoded = verifyToken(token)
  if (!decoded) return null

  const db = await getDatabase()
  const user = await db.collection<User>("users").findOne({
    _id: { $eq: new (await import("mongodb")).ObjectId(decoded.userId) },
  })

  return user
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

export function generateAdminToken(adminId: string): string {
  return jwt.sign({ adminId, type: "admin" }, ADMIN_JWT_SECRET, { expiresIn: "7d" })
}

export function verifyAdminToken(token: string): { adminId: string; type: string } | null {
  try {
    return jwt.verify(token, ADMIN_JWT_SECRET) as { adminId: string; type: string }
  } catch {
    return null
  }
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get("admin-token")?.value

  if (!token) return null

  const decoded = verifyAdminToken(token)
  if (!decoded) return null

  const db = await getDatabase()
  const { ObjectId } = await import("mongodb")
  const admin = await db.collection("admins").findOne({
    _id: new ObjectId(decoded.adminId),
  })

  return admin
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin()
  return !!admin
}
