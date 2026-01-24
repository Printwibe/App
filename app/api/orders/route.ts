import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"
import type { Order, Cart, Product, CustomDesign } from "@/lib/types"
import { ObjectId } from "mongodb"
import { put } from "@vercel/blob"
import { Notifications } from "@/lib/models/notifications"

function generateOrderId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")
  return `PW-${year}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { paymentMethod, shippingAddress, razorpayPaymentId, razorpayOrderId, discount, promoCode, manualPaymentDetails } = body

    const db = await getDatabase()

    // Get user's cart
    const cart = await db.collection<Cart>("carts").findOne({ userId: user._id })
    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Check inventory and prepare stock updates
    const productsCollection = db.collection<Product>("products")
    const stockUpdates: Array<{ productId: ObjectId; variant: { size: string; color: string }; quantity: number }> = []
    
    for (const item of cart.items) {
      const product = await productsCollection.findOne({ _id: item.productId })
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
      }

      const variant = product.variants.find(
        (v) => v.size === item.variant.size && v.color === item.variant.color
      )
      
      if (!variant) {
        return NextResponse.json({ 
          error: `Variant not found for ${product.name}: ${item.variant.size} - ${item.variant.color}` 
        }, { status: 400 })
      }

      if (variant.stock < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for ${product.name} (${item.variant.size} - ${item.variant.color}). Available: ${variant.stock}` 
        }, { status: 400 })
      }

      stockUpdates.push({
        productId: item.productId,
        variant: item.variant,
        quantity: item.quantity,
      })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => sum + (item.unitPrice + item.customizationFee) * item.quantity, 0)
    const shipping = 0 // Free shipping
    const discountAmount = discount || 0
    const total = subtotal + shipping - discountAmount

    // Generate order ID early for blob path
    const orderId = generateOrderId()

    // Upload designs to Vercel Blob (only when order is placed)
    const uploadedDesignsMap = new Map<number, any>()
    const uploadFailures: string[] = []
    
    for (let i = 0; i < cart.items.length; i++) {
      const item = cart.items[i]
      
      // Handle new customizationData format
      if (item.customizationData && item.customizationData.designLibrary && item.customizationData.viewDesigns) {
        const uploadedDesigns: Record<number, any> = {}
        const expectedViews = Object.keys(item.customizationData.viewDesigns).length
        
        // Create a map of design IDs to library items for quick lookup
        const designMap = new Map(
          item.customizationData.designLibrary.map((design: any) => [design.id, design])
        )
        
        // Process each view design
        for (const [viewIndex, viewDesign] of Object.entries(item.customizationData.viewDesigns) as [string, any][]) {
          const libraryDesign = designMap.get(viewDesign.designId)
          if (!libraryDesign) continue
          
          try {
            // Upload raw design file
            const base64Data = libraryDesign.url.split(",")[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const fileBlob = new Blob([byteArray], { type: "image/png" })
            
            const timestamp = Date.now()
            const sanitizedFilename = libraryDesign.name.replace(/[^a-zA-Z0-9.-]/g, "_")
            const blobPath = `designs/${user._id}/orders/${orderId}/view-${viewIndex}/${timestamp}-${sanitizedFilename}`
            
            const blob = await put(blobPath, fileBlob, {
              access: "public",
            })
            
            // Also upload positioned preview if available
            let previewBlobUrl = null
            if (viewDesign.preview) {
              try {
                const previewBase64 = viewDesign.preview.split(",")[1]
                const previewBytes = atob(previewBase64)
                const previewByteNumbers = new Array(previewBytes.length)
                for (let k = 0; k < previewBytes.length; k++) {
                  previewByteNumbers[k] = previewBytes.charCodeAt(k)
                }
                const previewByteArray = new Uint8Array(previewByteNumbers)
                const previewBlob = new Blob([previewByteArray], { type: "image/png" })
                
                const previewBlobPath = `designs/${user._id}/orders/${orderId}/view-${viewIndex}/${timestamp}-preview-${sanitizedFilename}`
                const previewUpload = await put(previewBlobPath, previewBlob, {
                  access: "public",
                })
                previewBlobUrl = previewUpload.url
              } catch (previewError) {
                console.error(`Failed to upload preview for view ${viewIndex}:`, previewError)
              }
            }
            
            // Save to database
            const designsCollection = db.collection<CustomDesign>("customDesigns")
            const newDesign: CustomDesign = {
              userId: user._id!,
              productId: item.productId,
              fileName: libraryDesign.name,
              fileUrl: blob.url,
              fileType: "image/png",
              fileSize: fileBlob.size,
              dimensions: { width: 500, height: 500 },
              printArea: { 
                x: viewDesign.customPosition.x, 
                y: viewDesign.customPosition.y, 
                width: viewDesign.customPosition.width, 
                height: viewDesign.customPosition.height 
              },
              customPosition: viewDesign.customPosition,
              designType: `view-${viewIndex}`,
              orderId: orderId,
              savedToLibrary: false,
              status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            const result = await designsCollection.insertOne(newDesign)
            
            uploadedDesigns[parseInt(viewIndex)] = {
              designId: result.insertedId.toString(),
              fileUrl: blob.url,
              fileName: newDesign.fileName,
              customPosition: viewDesign.customPosition,
              previewUrl: previewBlobUrl,
            }
          } catch (uploadError) {
            console.error(`Failed to upload design for view ${viewIndex}:`, uploadError)
            uploadFailures.push(`Item ${i + 1} - View ${parseInt(viewIndex) + 1}: ${uploadError instanceof Error ? uploadError.message : 'Upload failed'}`)
          }
        }
        
        // Check if all expected designs were uploaded
        const uploadedCount = Object.keys(uploadedDesigns).length
        if (uploadedCount < expectedViews) {
          uploadFailures.push(`Item ${i + 1}: Only ${uploadedCount} of ${expectedViews} designs uploaded successfully`)
        }
        
        uploadedDesignsMap.set(i, { viewDesigns: uploadedDesigns, notes: item.customizationData.notes })
      }
      // Handle legacy tempDesigns format
      else if (item.tempDesigns) {
        const uploadedDesigns: any = {}
        
        // Process each design area
        for (const areaType of ["front", "back", "wraparound", "preview"] as const) {
          const tempDesign = item.tempDesigns[areaType]
          if (!tempDesign) continue
          
          // Skip URL-based designs (already have URL)
          if (tempDesign.isUrl) {
            uploadedDesigns[areaType] = {
              designId: `url-${Date.now()}`,
              fileUrl: tempDesign.preview,
              fileName: "url-design",
            }
            continue
          }
          
          // Upload local file designs to Vercel Blob
          try {
            // Convert base64 to Blob
            const base64Data = tempDesign.preview.split(",")[1]
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let j = 0; j < byteCharacters.length; j++) {
              byteNumbers[j] = byteCharacters.charCodeAt(j)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const fileBlob = new Blob([byteArray], { type: tempDesign.fileType || "image/png" })
            
            // Upload to Vercel Blob with organized path
            const timestamp = Date.now()
            const sanitizedFilename = tempDesign.fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || `design-${timestamp}.png`
            const blobPath = `designs/${user._id}/orders/${orderId}/${areaType}/${timestamp}-${sanitizedFilename}`
            
            const blob = await put(blobPath, fileBlob, {
              access: "public",
            })
            
            // Save to database
            const designsCollection = db.collection<CustomDesign>("customDesigns")
            const newDesign: CustomDesign = {
              userId: user._id!,
              productId: item.productId,
              fileName: tempDesign.fileName || `design-${timestamp}.png`,
              fileUrl: blob.url,
              fileType: tempDesign.fileType || "image/png",
              fileSize: fileBlob.size,
              dimensions: { width: 500, height: 500 },
              printArea: { x: 50, y: 50, width: 200, height: 200 },
              customPosition: tempDesign.customPosition || undefined,
              designType: areaType,
              orderId: orderId,
              savedToLibrary: false,
              status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            }
            
            const result = await designsCollection.insertOne(newDesign)
            
            uploadedDesigns[areaType] = {
              designId: result.insertedId.toString(),
              fileUrl: blob.url,
              fileName: newDesign.fileName,
            }
          } catch (uploadError) {
            console.error(`Failed to upload ${areaType} design:`, uploadError)
            uploadFailures.push(`Item ${i + 1} - ${areaType}: ${uploadError instanceof Error ? uploadError.message : 'Upload failed'}`)
          }
        }
        
        uploadedDesignsMap.set(i, uploadedDesigns)
      }
    }

    // Check if there were any critical upload failures
    if (uploadFailures.length > 0) {
      console.error('Design upload failures:', uploadFailures)
      return NextResponse.json(
        { 
          error: 'Failed to upload custom designs. Please try again.',
          details: uploadFailures 
        }, 
        { status: 500 }
      )
    }

    // Create order
    const order: Order = {
      orderId,
      userId: user._id!,
      items: cart.items.map((item, index) => {
        const uploadedDesigns = uploadedDesignsMap.get(index)
        
        return {
          productId: item.productId,
          name: "", // Would be populated from product lookup
          variant: item.variant,
          quantity: item.quantity,
          isCustomized: item.isCustomized,
          // New format: viewDesigns (numbered views 0, 1, 2, etc.)
          viewDesigns: uploadedDesigns?.viewDesigns ? uploadedDesigns.viewDesigns : undefined,
          // Legacy format: customDesigns (front/back/wraparound/preview)
          customDesigns: uploadedDesigns && (uploadedDesigns.front || uploadedDesigns.back || uploadedDesigns.wraparound || uploadedDesigns.preview) ? {
            front: uploadedDesigns.front,
            back: uploadedDesigns.back,
            wraparound: uploadedDesigns.wraparound,
            preview: uploadedDesigns.preview,
            notes: item.tempDesigns?.notes,
          } : (item.customDesigns ? {
            front: item.customDesigns.frontDesignId
              ? {
                  designId: item.customDesigns.frontDesignId,
                  fileUrl: "", // Would be populated from design lookup
                  fileName: "",
                }
              : undefined,
            back: item.customDesigns.backDesignId
              ? {
                  designId: item.customDesigns.backDesignId,
                  fileUrl: "", // Would be populated from design lookup
                  fileName: "",
                }
              : undefined,
            wraparound: item.customDesigns.wraparoundDesignId
              ? {
                  designId: item.customDesigns.wraparoundDesignId,
                  fileUrl: "", // Would be populated from design lookup
                  fileName: "",
                }
              : undefined,
            preview: item.customDesigns.previewDesignId
              ? {
                  designId: item.customDesigns.previewDesignId,
                  fileUrl: "", // Would be populated from design lookup
                  fileName: "",
                }
              : undefined,
            notes: item.customDesigns.notes,
          } : undefined),
          customizationNotes: uploadedDesigns?.notes,
          // Legacy support
          customDesign: item.customDesignId
            ? {
                designId: item.customDesignId,
                fileUrl: "", // Would be populated from design lookup
                fileName: "",
                printArea: { x: 0, y: 0, width: 0, height: 0 },
              }
            : undefined,
          unitPrice: item.unitPrice,
          customizationFee: item.customizationFee,
          itemTotal: (item.unitPrice + item.customizationFee) * item.quantity,
        }
      }),
      shippingAddress: {
        type: shippingAddress.type || "home",
        house: shippingAddress.house,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        isDefault: shippingAddress.isDefault || false,
      },
      paymentMethod,
      paymentStatus: paymentMethod === "cod" || paymentMethod === "manual_upi" || paymentMethod === "manual_qr" ? "pending" : "paid",
      razorpayOrderId,
      razorpayPaymentId,
      manualPaymentDetails: (paymentMethod === "manual_upi" || paymentMethod === "manual_qr") ? manualPaymentDetails : undefined,
      orderStatus: "confirmed",
      subtotal,
      shipping,
      discount: discountAmount,
      promoCode: promoCode || undefined,
      total,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const insertResult = await db.collection<Order>("orders").insertOne(order)

    // Create notification for new order
    const hasCustomizedItems = cart.items.some(item => item.isCustomized)
    await Notifications.create({
      type: hasCustomizedItems ? "customized_order" : "new_order",
      title: hasCustomizedItems ? "New Customized Order" : "New Order Placed",
      message: `Order ${orderId} has been placed${hasCustomizedItems ? ' with custom designs' : ''}. Total: ₹${total.toFixed(2)}`,
      orderId: insertResult.insertedId.toString(),
      orderNumber: orderId,
      isRead: false
    })

    // Deduct inventory for confirmed orders
    for (const update of stockUpdates) {
      await productsCollection.updateOne(
        {
          _id: update.productId,
          "variants.size": update.variant.size,
          "variants.color": update.variant.color,
        },
        {
          $inc: { "variants.$.stock": -update.quantity },
          $set: { updatedAt: new Date() },
        }
      )
    }

    // Clear cart
    await db.collection<Cart>("carts").deleteOne({ userId: user._id })

    // TODO: Send confirmation email
    // await sendOrderConfirmationEmail(user.email, order)

    return NextResponse.json({
      message: "Order placed successfully",
      orderId,
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const orders = await db.collection<Order>("orders").find({ userId: user._id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
