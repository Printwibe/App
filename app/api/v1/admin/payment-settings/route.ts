import { type NextRequest, NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/auth"
import { getPaymentSettings, updatePaymentSettings } from "@/lib/models/payment-settings"

// GET - Get payment settings
export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await getPaymentSettings()
    
    // Return default settings if none exist
    if (!settings) {
      return NextResponse.json({
        razorpay: { enabled: true },
        cod: { enabled: true },
        manualPayments: {
          upi: { enabled: false },
          qrCode: { enabled: false }
        }
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Get payment settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update payment settings
export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { razorpay, cod, manualPayments } = body

    const success = await updatePaymentSettings({
      razorpay,
      cod,
      manualPayments
    })

    if (!success) {
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({ message: "Payment settings updated successfully" })
  } catch (error) {
    console.error("Update payment settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
