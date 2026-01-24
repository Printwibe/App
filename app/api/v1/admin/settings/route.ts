import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyAdminToken } from "@/lib/auth"

export interface StoreSettings {
  _id?: string
  storeName: string
  adminEmail: string
  supportEmail: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  businessHours: string
  aboutUs: string
  shippingCost: number
  taxRate: number
  currency: string
  paymentMethods?: {
    razorpay?: {
      enabled: boolean
      name: string
      description: string
    }
    cod?: {
      enabled: boolean
      name: string
      description: string
    }
  }
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  policies?: {
    termsOfService?: string
    privacyPolicy?: string
    returnPolicy?: string
  }
  updatedAt?: Date
  createdAt?: Date
}

/**
 * GET /api/v1/admin/settings
 * Get store settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const settingsCollection = db.collection<StoreSettings>("settings")

    // Get settings (there should be only one document)
    let settings = await settingsCollection.findOne({})

    // If no settings exist, create default settings
    if (!settings) {
      const defaultSettings: StoreSettings = {
        storeName: "PrintWibe",
        adminEmail: "admin@printwibe.com",
        supportEmail: "contact@printwibe.com",
        phone: "+1 (555) 123-4567",
        address: "123 Main Street",
        city: "San Francisco",
        state: "CA",
        country: "United States",
        postalCode: "94105",
        businessHours: "Monday - Friday: 9:00 AM - 6:00 PM",
        aboutUs: "PrintWibe is a leading print-on-demand platform offering custom merchandise.",
        shippingCost: 15.0,
        taxRate: 8.5,
        currency: "INR",
        paymentMethods: {
          razorpay: {
            enabled: true,
            name: "Pay Online",
            description: "UPI, Credit/Debit Card, Net Banking & Wallets"
          },
          cod: {
            enabled: true,
            name: "Cash on Delivery",
            description: "Pay with cash when your order is delivered"
          }
        },
        socialMedia: {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
        },
        policies: {
          termsOfService: "",
          privacyPolicy: "",
          returnPolicy: "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await settingsCollection.insertOne(defaultSettings)
      settings = await settingsCollection.findOne({})
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Settings fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PUT /api/v1/admin/settings
 * Update store settings (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    // Verify admin token
    const token = request.cookies.get("admin-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const adminAuth = verifyAdminToken(token)
    if (!adminAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    const requiredFields = ["storeName", "adminEmail", "supportEmail", "phone", "address", "city", "state", "country"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const db = await getDatabase()
    const settingsCollection = db.collection<StoreSettings>("settings")

    // Update settings
    const updateData: Partial<StoreSettings> = {
      storeName: body.storeName,
      adminEmail: body.adminEmail,
      supportEmail: body.supportEmail,
      phone: body.phone,
      address: body.address,
      city: body.city,
      state: body.state,
      country: body.country,
      postalCode: body.postalCode || "",
      businessHours: body.businessHours || "",
      aboutUs: body.aboutUs || "",
      shippingCost: Number(body.shippingCost) || 0,
      taxRate: Number(body.taxRate) || 0,
      currency: body.currency || "INR",
      paymentMethods: body.paymentMethods || {
        razorpay: { enabled: true, name: "Pay Online", description: "UPI, Credit/Debit Card, Net Banking & Wallets" },
        cod: { enabled: true, name: "Cash on Delivery", description: "Pay with cash when your order is delivered" }
      },
      socialMedia: body.socialMedia || {},
      policies: body.policies || {},
      updatedAt: new Date(),
    }

    // Check if settings exist
    const existingSettings = await settingsCollection.findOne({})

    if (existingSettings) {
      // Update existing settings
      await settingsCollection.updateOne({}, { $set: updateData })
    } else {
      // Create new settings
      await settingsCollection.insertOne({
        ...updateData,
        createdAt: new Date(),
      } as StoreSettings)
    }

    return NextResponse.json({
      message: "Settings updated successfully",
    })
  } catch (error) {
    console.error("Settings update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
