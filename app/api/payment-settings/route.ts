import { NextResponse } from "next/server"
import { getPaymentSettings } from "@/lib/models/payment-settings"

// GET - Get public payment settings (for checkout page)
export async function GET() {
  try {
    const settings = await getPaymentSettings()
    
    // Return only public information (no admin secrets)
    const publicSettings = {
      razorpay: { enabled: settings?.razorpay?.enabled ?? true },
      cod: { enabled: settings?.cod?.enabled ?? true },
      manualPayments: {
        upi: {
          enabled: settings?.manualPayments?.upi?.enabled ?? false,
          upiId: settings?.manualPayments?.upi?.upiId ?? ""
        },
        qrCode: {
          enabled: settings?.manualPayments?.qrCode?.enabled ?? false,
          qrCodeUrl: settings?.manualPayments?.qrCode?.qrCodeUrl ?? ""
        }
      }
    }

    return NextResponse.json(publicSettings)
  } catch (error) {
    console.error("Get payment settings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
