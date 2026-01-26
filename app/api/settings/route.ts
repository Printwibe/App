import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import type { StoreSettings } from "../v1/admin/settings/route";

/**
 * GET /api/settings
 * Get public store settings (no authentication required)
 * Used by frontend to display store information
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const settingsCollection = db.collection<StoreSettings>("settings");

    // Get settings
    const settings = await settingsCollection.findOne({});

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        settings: {
          storeName: "PrintWibe",
          supportEmail: "contact@printwibe.com",
          phone: "+1 (555) 123-4567",
          address: "123 Main Street",
          city: "San Francisco",
          state: "CA",
          country: "United States",
          postalCode: "94105",
          businessHours: "Monday - Friday: 9:00 AM - 6:00 PM",
          aboutUs:
            "PrintWibe is a leading print-on-demand platform offering custom merchandise.",
          currency: "INR",
          shippingCost: 0,
          paymentMethods: {
            razorpay: {
              enabled: true,
              name: "Pay Online",
              description: "UPI, Credit/Debit Card, Net Banking & Wallets",
            },
            cod: {
              enabled: true,
              name: "Cash on Delivery",
              description: "Pay with cash when your order is delivered",
            },
          },
          socialMedia: {},
        },
      });
    }

    // Return only public settings (exclude admin email and sensitive data)
    return NextResponse.json({
      settings: {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        country: settings.country,
        postalCode: settings.postalCode,
        businessHours: settings.businessHours,
        aboutUs: settings.aboutUs,
        currency: settings.currency,
        shippingCost: settings.shippingCost ?? 0,
        paymentMethods: settings.paymentMethods || {
          razorpay: {
            enabled: true,
            name: "Pay Online",
            description: "UPI, Credit/Debit Card, Net Banking & Wallets",
          },
          cod: {
            enabled: true,
            name: "Cash on Delivery",
            description: "Pay with cash when your order is delivered",
          },
        },
        socialMedia: settings.socialMedia || {},
        policies: settings.policies || {},
      },
    });
  } catch (error) {
    console.error("Public settings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
