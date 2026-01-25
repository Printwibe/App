import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { del } from "@vercel/blob"
import { ObjectId } from "mongodb"

export const maxDuration = 300 // 5 minutes max

/**
 * Cleanup old customized designs and payment screenshots from Vercel Blob
 * - Delivered orders: cleanup designs after 180 days
 * - Canceled orders: cleanup designs + screenshots after 90 days
 * 
 * Should be triggered by a cron service (e.g., Vercel Cron)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const cronSecret = request.headers.get("authorization")?.replace("Bearer ", "")
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const ordersCollection = db.collection("orders")
    
    const now = new Date()
    const deliveredCutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) // 180 days ago
    const canceledCutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) // 90 days ago

    let deletedCount = 0
    let errorCount = 0
    const deletedFiles: string[] = []
    const errors: string[] = []

    // Cleanup delivered orders (designs only) - older than 180 days
    const deliveredOrders = await ordersCollection
      .find({
        status: "delivered",
        createdAt: { $lt: deliveredCutoff },
      })
      .toArray()

    for (const order of deliveredOrders) {
      try {
        // Delete customized design images
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            // Check for customDesigns (old format)
            if (item.customDesignId) {
              try {
                const designUrl = `/uploads/designs/${item.customDesignId}`
                await del(designUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
                deletedFiles.push(designUrl)
              } catch (e) {
                // Design might have already been deleted
              }
            }

            // Check for customizationData (new format)
            if (item.customizationData?.designLibrary && Array.isArray(item.customizationData.designLibrary)) {
              for (const design of item.customizationData.designLibrary) {
                if (design.url && (design.url.includes("blob.vercel-storage.com") || design.url.includes("public.blob.vercel-storage.com"))) {
                  try {
                    await del(design.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
                    deletedFiles.push(design.url)
                  } catch (e) {
                    // Design might have already been deleted
                  }
                }
              }
            }
          }
        }

        deletedCount++
      } catch (error) {
        errorCount++
        errors.push(`Order ${order._id}: ${String(error)}`)
      }
    }

    // Cleanup canceled orders (designs + payment screenshots) - older than 90 days
    const canceledOrders = await ordersCollection
      .find({
        status: "canceled",
        createdAt: { $lt: canceledCutoff },
      })
      .toArray()

    for (const order of canceledOrders) {
      try {
        // Delete customized designs (same as delivered)
        if (order.items && Array.isArray(order.items)) {
          for (const item of order.items) {
            // Check for customDesigns (old format)
            if (item.customDesignId) {
              try {
                const designUrl = `/uploads/designs/${item.customDesignId}`
                await del(designUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
                deletedFiles.push(designUrl)
              } catch (e) {
                // Design might have already been deleted
              }
            }

            // Check for customizationData (new format)
            if (item.customizationData?.designLibrary && Array.isArray(item.customizationData.designLibrary)) {
              for (const design of item.customizationData.designLibrary) {
                if (design.url && (design.url.includes("blob.vercel-storage.com") || design.url.includes("public.blob.vercel-storage.com"))) {
                  try {
                    await del(design.url, { token: process.env.BLOB_READ_WRITE_TOKEN })
                    deletedFiles.push(design.url)
                  } catch (e) {
                    // Design might have already been deleted
                  }
                }
              }
            }
          }
        }

        // Delete payment screenshots for canceled orders
        if (order.manualPaymentDetails?.screenshotUrl) {
          try {
            const screenshotUrl = order.manualPaymentDetails.screenshotUrl
            if (screenshotUrl.includes("blob.vercel-storage.com") || screenshotUrl.includes("public.blob.vercel-storage.com")) {
              await del(screenshotUrl, { token: process.env.BLOB_READ_WRITE_TOKEN })
              deletedFiles.push(screenshotUrl)
            }
          } catch (e) {
            // Screenshot might have already been deleted
          }
        }

        deletedCount++
      } catch (error) {
        errorCount++
        errors.push(`Order ${order._id}: ${String(error)}`)
      }
    }

    console.log("=== Blob Cleanup Summary ===")
    console.log(`✓ Processed: ${deliveredOrders.length} delivered orders (180+ days)`)
    console.log(`✓ Processed: ${canceledOrders.length} canceled orders (90+ days)`)
    console.log(`✓ Successfully cleaned: ${deletedCount} orders`)
    console.log(`✓ Files deleted: ${deletedFiles.length}`)
    if (errorCount > 0) {
      console.warn(`⚠️  Errors: ${errorCount}`)
      errors.forEach(e => console.warn(`  - ${e}`))
    }

    return NextResponse.json({
      success: true,
      message: "Blob cleanup completed",
      summary: {
        deliveredOrdersProcessed: deliveredOrders.length,
        canceledOrdersProcessed: canceledOrders.length,
        ordersSuccessful: deletedCount,
        filesDeleted: deletedFiles.length,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors.slice(0, 10) : [],
      },
    })
  } catch (error) {
    console.error("Blob cleanup error:", error)
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 }
    )
  }
}
