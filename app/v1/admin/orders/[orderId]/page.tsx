"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, Download, Printer, Loader2, Package, User, CreditCard, MapPin, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useCurrency } from "@/hooks/use-currency"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-cyan-100 text-cyan-800 border-cyan-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
}

interface OrderData {
  _id: string
  orderId: string
  userId: string
  items: Array<{
    productId: string
    name: string
    productImage?: string
    variant: {
      size: string
      color: string
    }
    quantity: number
    isCustomized: boolean
    // New format: viewDesigns (numbered views)
    viewDesigns?: Record<number, {
      designId: string
      fileUrl: string
      fileName: string
      customPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotation?: number
      }
    }>
    customizationNotes?: string
    // Legacy format
    customDesign?: {
      fileUrl: string
      fileName: string
    }
    customDesigns?: {
      front?: {
        fileUrl: string
        fileName: string
      }
      back?: {
        fileUrl: string
        fileName: string
      }
      wraparound?: {
        fileUrl: string
        fileName: string
      }
      preview?: {
        fileUrl: string
        fileName: string
      }
      notes?: string
    }
    unitPrice: number
    customizationFee: number
    itemTotal: number
  }>
  shippingAddress: {
    type: string
    house: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  manualPaymentDetails?: {
    transactionId?: string
    screenshotUrl?: string
    method?: "upi" | "qr"
  }
  orderStatus: string
  subtotal: number
  shipping: number
  discount: number
  promoCode?: string
  total: number
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    email: string
    phone?: string
  }
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  const [order, setOrder] = useState<OrderData | null>(null)
  const [status, setStatus] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState<{url: string, name: string, type: string} | null>(null)
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/orders?search=${orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.orders && data.orders.length > 0) {
          const orderData = data.orders[0]
          setOrder(orderData)
          setStatus(orderData.orderStatus)
          setPaymentStatus(orderData.paymentStatus)
        }
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!order) return
    
    setIsUpdating(true)
    try {
      const updatePayload: any = { status }
      
      // Auto-update payment status to paid when delivered
      if (status === "delivered") {
        updatePayload.paymentStatus = "paid"
      }
      
      const response = await fetch(`/api/v1/admin/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })

      if (response.ok) {
        const updatedOrder = { ...order, orderStatus: status }
        if (status === "delivered") {
          updatedOrder.paymentStatus = "paid"
          setPaymentStatus("paid")
        }
        setOrder(updatedOrder)
        alert("Order status updated successfully!")
      } else {
        alert("Failed to update order status")
        setStatus(order.orderStatus)
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert("Error updating order status")
      setStatus(order.orderStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePaymentStatusUpdate = async () => {
    if (!order) return
    
    setIsUpdatingPayment(true)
    try {
      const response = await fetch(`/api/v1/admin/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      })

      if (response.ok) {
        setOrder({ ...order, paymentStatus })
        alert("Payment status updated successfully!")
      } else {
        alert("Failed to update payment status")
        setPaymentStatus(order.paymentStatus)
      }
    } catch (error) {
      console.error("Failed to update payment status:", error)
      alert("Error updating payment status")
      setPaymentStatus(order.paymentStatus)
    } finally {
      setIsUpdatingPayment(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
        <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/v1/admin/orders")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/v1/admin/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-medium">Order {order.orderId}</h1>
              <Badge variant="outline" className={`${statusColors[order.orderStatus]}`}>
                {order.orderStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Order Items ({order.items.length})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className="flex flex-col gap-2">
                      {/* New format: viewDesigns (numbered views) */}
                      {item.viewDesigns && Object.keys(item.viewDesigns).length > 0 ? (
                        Object.entries(item.viewDesigns).map(([viewIndex, design]: [string, any]) => (
                            <div key={viewIndex} className="relative">
                              <img
                                src={design?.fileUrl || "/placeholder.svg"}
                                alt={`View ${parseInt(viewIndex) + 1} design`}
                                className="w-20 h-20 rounded-lg object-cover border"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg"
                                }}
                              />
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                                View {parseInt(viewIndex) + 1}
                              </span>
                            </div>
                          ))
                      ) : null}
                      
                      {/* Legacy format: customDesigns (front/back/wraparound/preview) */}
                      {!item.viewDesigns && item.customDesigns?.front && (
                        <div className="relative">
                          <img
                            src={item.customDesigns.front.fileUrl || "/placeholder.svg"}
                            alt="Front design"
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Front
                          </span>
                        </div>
                      )}
                      {!item.viewDesigns && item.customDesigns?.back && (
                        <div className="relative">
                          <img
                            src={item.customDesigns.back.fileUrl || "/placeholder.svg"}
                            alt="Back design"
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Back
                          </span>
                        </div>
                      )}
                      {!item.viewDesigns && item.customDesigns?.wraparound && (
                        <div className="relative">
                          <img
                            src={item.customDesigns.wraparound.fileUrl || "/placeholder.svg"}
                            alt="Wraparound design"
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Wrap
                          </span>
                        </div>
                      )}
                      {!item.viewDesigns && item.customDesigns?.preview && (
                        <div className="relative">
                          <img
                            src={item.customDesigns.preview.fileUrl || "/placeholder.svg"}
                            alt="Preview/Mockup"
                            className="w-20 h-20 rounded-lg object-cover border"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Mock
                          </span>
                        </div>
                      )}
                      
                      {/* Legacy support: single customDesign */}
                      {!item.viewDesigns && !item.customDesigns && item.customDesign && (
                        <img
                          src={item.customDesign.fileUrl || "/placeholder.svg"}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                      )}
                      
                      {/* Show product image if no custom designs */}
                      {!item.viewDesigns && !item.customDesigns && !item.customDesign && item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{item.name || "Product"}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Size: {item.variant.size} • Color: {item.variant.color}
                      </div>
                      {item.isCustomized && (
                        <Badge variant="secondary" className="mt-2 text-xs bg-orange-100 text-orange-800 border-orange-200">
                          ⚡ Customized
                        </Badge>
                      )}
                      {/* New format: customizationNotes */}
                      {item.customizationNotes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs">
                          <span className="font-medium">Notes:</span> {item.customizationNotes}
                        </div>
                      )}
                      {/* Legacy format: customDesigns.notes */}
                      {!item.customizationNotes && item.customDesigns?.notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs">
                          <span className="font-medium">Notes:</span> {item.customDesigns.notes}
                        </div>
                      )}
                      {item.customizationFee > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          + Customization: {currencySymbol}{item.customizationFee.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Qty: {item.quantity}</div>
                      <div className="font-bold text-sm">{currencySymbol}{item.itemTotal.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Customization Details - Show if any item is customized */}
          {order.items.some(item => item.isCustomized) && (
            <Card className="border-none shadow-sm">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Customization Details</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    {order.items.filter(item => item.isCustomized).length} Item{order.items.filter(item => item.isCustomized).length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {order.items.filter(item => item.isCustomized).map((item, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{item.name}</h4>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          Custom Design
                        </Badge>
                      </div>

                      {/* User Notes - New Format */}
                      {item.customizationNotes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-xs font-semibold text-blue-900 mb-1">Customer Instructions:</div>
                          <p className="text-sm text-blue-800">{item.customizationNotes}</p>
                        </div>
                      )}
                      
                      {/* User Notes - Legacy Format */}
                      {!item.customizationNotes && item.customDesigns?.notes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-xs font-semibold text-blue-900 mb-1">Customer Instructions:</div>
                          <p className="text-sm text-blue-800">{item.customDesigns.notes}</p>
                        </div>
                      )}

                      {/* New Format: viewDesigns */}
                      {item.viewDesigns && Object.keys(item.viewDesigns).length > 0 && (
                        <div className="space-y-4">
                          {Object.entries(item.viewDesigns).map(([viewIndex, design]: [string, any]) => {
                            const productImage = item.productImage // Use the enriched product image
                            
                            return (
                            <div key={viewIndex} className="border rounded-lg p-4 space-y-4 bg-white">
                              <div className="flex items-center justify-between pb-3 border-b">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-sm">
                                    View {parseInt(viewIndex) + 1}
                                  </Badge>
                                  <span className="text-sm font-medium">Design</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{design.fileName}</span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Positioned Preview - Show design on product */}
                                {design.customPosition && productImage && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-blue-700">Positioned Preview</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                          try {
                                            const canvas = document.createElement('canvas')
                                            const ctx = canvas.getContext('2d')
                                            if (!ctx) return

                                            canvas.width = 1000
                                            canvas.height = 1000

                                            // Load and draw product image
                                            const productImg = new window.Image()
                                            productImg.crossOrigin = 'anonymous'
                                            await new Promise((resolve, reject) => {
                                              productImg.onload = resolve
                                              productImg.onerror = reject
                                              productImg.src = productImage
                                            })
                                            ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height)

                                            // Load and draw design overlay
                                            const designImg = new window.Image()
                                            designImg.crossOrigin = 'anonymous'
                                            await new Promise((resolve, reject) => {
                                              designImg.onload = resolve
                                              designImg.onerror = reject
                                              designImg.src = design.fileUrl
                                            })

                                            const x = (design.customPosition.x / 100) * canvas.width
                                            const y = (design.customPosition.y / 100) * canvas.height
                                            const width = (design.customPosition.width / 100) * canvas.width
                                            const height = (design.customPosition.height / 100) * canvas.height

                                            ctx.save()
                                            ctx.translate(x + width / 2, y + height / 2)
                                            ctx.rotate((design.customPosition.rotation || 0) * Math.PI / 180)
                                            ctx.drawImage(designImg, -width / 2, -height / 2, width, height)
                                            ctx.restore()

                                            // Download
                                            canvas.toBlob((blob) => {
                                              if (blob) {
                                                const url = window.URL.createObjectURL(blob)
                                                const link = document.createElement('a')
                                                link.href = url
                                                link.download = `${design.fileName.replace(/\.[^.]+$/, '')}-positioned-preview.png`
                                                document.body.appendChild(link)
                                                link.click()
                                                document.body.removeChild(link)
                                                window.URL.revokeObjectURL(url)
                                              }
                                            })
                                          } catch (error) {
                                            console.error('Download failed:', error)
                                            alert('Failed to download positioned preview. Trying direct download...')
                                            // Fallback: download design file
                                            const response = await fetch(design.fileUrl)
                                            const blob = await response.blob()
                                            const url = window.URL.createObjectURL(blob)
                                            const link = document.createElement('a')
                                            link.href = url
                                            link.download = design.fileName
                                            document.body.appendChild(link)
                                            link.click()
                                            document.body.removeChild(link)
                                            window.URL.revokeObjectURL(url)
                                          }
                                        }}
                                      >
                                        <Download className="h-3 w-3 mr-1" />
                                        Download
                                      </Button>
                                    </div>
                                    <div 
                                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-200 cursor-pointer hover:border-blue-400 transition-colors"
                                      onClick={async () => {
                                        try {
                                          // Create composite image for preview
                                          const canvas = document.createElement('canvas')
                                          const ctx = canvas.getContext('2d')
                                          if (!ctx) return

                                          canvas.width = 1000
                                          canvas.height = 1000

                                          // Load product image
                                          const productImg = new window.Image()
                                          productImg.crossOrigin = 'anonymous'
                                          await new Promise((resolve, reject) => {
                                            productImg.onload = resolve
                                            productImg.onerror = reject
                                            productImg.src = productImage
                                          })
                                          ctx.drawImage(productImg, 0, 0, canvas.width, canvas.height)

                                          // Load design overlay
                                          const designImg = new window.Image()
                                          designImg.crossOrigin = 'anonymous'
                                          await new Promise((resolve, reject) => {
                                            designImg.onload = resolve
                                            designImg.onerror = reject
                                            designImg.src = design.fileUrl
                                          })

                                          const x = (design.customPosition.x / 100) * canvas.width
                                          const y = (design.customPosition.y / 100) * canvas.height
                                          const width = (design.customPosition.width / 100) * canvas.width
                                          const height = (design.customPosition.height / 100) * canvas.height

                                          ctx.save()
                                          ctx.translate(x + width / 2, y + height / 2)
                                          ctx.rotate((design.customPosition.rotation || 0) * Math.PI / 180)
                                          ctx.drawImage(designImg, -width / 2, -height / 2, width, height)
                                          ctx.restore()

                                          // Convert to data URL and show in preview
                                          const compositeUrl = canvas.toDataURL('image/png')
                                          setPreviewImage({
                                            url: compositeUrl,
                                            name: `${design.fileName.replace(/\.[^.]+$/, '')}-positioned-preview.png`,
                                            type: `View ${parseInt(viewIndex) + 1} - Positioned Preview`
                                          })
                                        } catch (error) {
                                          console.error('Preview failed:', error)
                                          // Fallback to original design
                                          setPreviewImage({
                                            url: design.fileUrl,
                                            name: design.fileName,
                                            type: `View ${parseInt(viewIndex) + 1} - Design`
                                          })
                                        }
                                      }}
                                    >
                                      <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 absolute top-0 left-0 z-10 rounded-br">
                                        Click to enlarge
                                      </div>
                                      {/* Product image as background */}
                                      <img
                                        src={productImage}
                                        alt="Product"
                                        className="absolute inset-0 w-full h-full object-contain"
                                      />
                                      {/* Design overlay */}
                                      <img
                                        src={design.fileUrl}
                                        alt={`View ${parseInt(viewIndex) + 1} design`}
                                        className="absolute object-contain"
                                        style={{
                                          left: `${design.customPosition.x}%`,
                                          top: `${design.customPosition.y}%`,
                                          width: `${design.customPosition.width}%`,
                                          height: `${design.customPosition.height}%`,
                                          transform: `rotate(${design.customPosition.rotation || 0}deg)`,
                                          transformOrigin: 'center',
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Position: {design.customPosition.width.toFixed(0)}% × {design.customPosition.height.toFixed(0)}%
                                      {design.customPosition.rotation !== 0 && ` • ${design.customPosition.rotation}°`}
                                    </div>
                                  </div>
                                )}
                              
                                {/* Raw Design File */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-700">Raw Design File</span>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={async () => {
                                        try {
                                          const response = await fetch(design.fileUrl)
                                          const blob = await response.blob()
                                          const url = window.URL.createObjectURL(blob)
                                          const link = document.createElement('a')
                                          link.href = url
                                          link.download = design.fileName || `view-${parseInt(viewIndex) + 1}-design.png`
                                          document.body.appendChild(link)
                                          link.click()
                                          document.body.removeChild(link)
                                          window.URL.revokeObjectURL(url)
                                        } catch (error) {
                                          console.error('Download failed:', error)
                                        }
                                      }}
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                  <div 
                                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-gray-400 transition-all"
                                    onClick={() => setPreviewImage({
                                      url: design.fileUrl,
                                      name: design.fileName,
                                      type: `View ${parseInt(viewIndex) + 1} - Raw Design`
                                    })}
                                  >
                                    <div className="text-xs bg-gray-200 text-gray-700 px-2 py-1 absolute top-0 left-0 z-10 rounded-br">
                                      Click to enlarge
                                    </div>
                                    <img
                                      src={design.fileUrl}
                                      alt={`View ${parseInt(viewIndex) + 1} design`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">{design.fileName}</p>
                                </div>
                              </div>
                            </div>
                          )})}
                        </div>
                      )}

                      {/* Legacy Format: customDesigns (front/back/wraparound/preview) */}
                      {!item.viewDesigns && item.customDesigns && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Front Design */}
                        {item.customDesigns?.front && (
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Front Design</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(item.customDesigns!.front!.fileUrl)
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = item.customDesigns!.front!.fileName || 'front-design.png'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                  }
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <div 
                              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-gray-400 transition-all"
                              onClick={() => setPreviewImage({
                                url: item.customDesigns!.front!.fileUrl,
                                name: item.customDesigns!.front!.fileName,
                                type: 'Front Design'
                              })}
                            >
                              <img
                                src={item.customDesigns.front.fileUrl}
                                alt="Front design"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{item.customDesigns.front.fileName}</p>
                          </div>
                        )}

                        {/* Back Design */}
                        {item.customDesigns?.back && (
                          <div className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Back Design</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(item.customDesigns!.back!.fileUrl)
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = item.customDesigns!.back!.fileName || 'back-design.png'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                  }
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <div 
                              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-gray-400 transition-all"
                              onClick={() => setPreviewImage({
                                url: item.customDesigns!.back!.fileUrl,
                                name: item.customDesigns!.back!.fileName,
                                type: 'Back Design'
                              })}
                            >
                              <img
                                src={item.customDesigns.back.fileUrl}
                                alt="Back design"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{item.customDesigns.back.fileName}</p>
                          </div>
                        )}

                        {/* Wraparound Design */}
                        {item.customDesigns?.wraparound && (
                          <div className="border rounded-lg p-4 space-y-3 md:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Wraparound Design</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(item.customDesigns!.wraparound!.fileUrl)
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = item.customDesigns!.wraparound!.fileName || 'wraparound-design.png'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                  }
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <div 
                              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-gray-400 transition-all"
                              onClick={() => setPreviewImage({
                                url: item.customDesigns!.wraparound!.fileUrl,
                                name: item.customDesigns!.wraparound!.fileName,
                                type: 'Wraparound Design'
                              })}
                            >
                              <img
                                src={item.customDesigns.wraparound.fileUrl}
                                alt="Wraparound design"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{item.customDesigns.wraparound.fileName}</p>
                          </div>
                        )}

                        {/* Preview/Mockup */}
                        {item.customDesigns?.preview && (
                          <div className="border rounded-lg p-4 space-y-3 md:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Customer Mockup Preview</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    const response = await fetch(item.customDesigns!.preview!.fileUrl)
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = item.customDesigns!.preview!.fileName || 'preview-mockup.png'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } catch (error) {
                                    console.error('Download failed:', error)
                                  }
                                }}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                            <div 
                              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:border-2 hover:border-gray-400 transition-all"
                              onClick={() => setPreviewImage({
                                url: item.customDesigns!.preview!.fileUrl,
                                name: item.customDesigns!.preview!.fileName,
                                type: 'Customer Mockup Preview'
                              })}
                            >
                              <img
                                src={item.customDesigns.preview.fileUrl}
                                alt="Preview mockup"
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">{item.customDesigns.preview.fileName}</p>
                          </div>
                        )}
                      </div>
                        </>
                      )}

                      {index < order.items.filter(i => i.isCustomized).length - 1 && (
                        <Separator className="my-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === "manual_upi" ? "UPI (Manual)" : 
                   order.paymentMethod === "manual_qr" ? "QR Code (Manual)" : 
                   order.paymentMethod}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <Badge variant="outline" className={`${paymentStatusColors[order.paymentStatus]}`}>
                  {order.paymentStatus}
                </Badge>
              </div>
              {order.razorpayPaymentId && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Transaction ID</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.razorpayPaymentId}</span>
                  </div>
                </>
              )}
              {order.manualPaymentDetails && (
                <>
                  <Separator />
                  <div className="space-y-3 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-semibold">Manual Payment Proof</span>
                    </div>
                    {order.manualPaymentDetails.transactionId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                          {order.manualPaymentDetails.transactionId}
                        </span>
                      </div>
                    )}
                    {order.manualPaymentDetails.screenshotUrl && (
                      <div className="space-y-2">
                        <span className="text-xs text-muted-foreground block">Payment Screenshot</span>
                        <div 
                          className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-orange-200 cursor-pointer hover:border-orange-400 transition-all"
                          onClick={() => setPreviewImage({
                            url: order.manualPaymentDetails!.screenshotUrl!,
                            name: "payment-screenshot.png",
                            type: "Payment Screenshot"
                          })}
                        >
                          <img
                            src={order.manualPaymentDetails.screenshotUrl}
                            alt="Payment Screenshot"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              console.error('Image load error:', order.manualPaymentDetails?.screenshotUrl)
                              e.currentTarget.src = '/placeholder.svg'
                            }}
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={async (e) => {
                            e.stopPropagation()
                            try {
                              const response = await fetch(order.manualPaymentDetails!.screenshotUrl!)
                              const blob = await response.blob()
                              const url = window.URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `payment-${order.orderId}.png`
                              document.body.appendChild(link)
                              link.click()
                              document.body.removeChild(link)
                              window.URL.revokeObjectURL(url)
                            } catch (error) {
                              console.error('Download failed:', error)
                            }
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Screenshot
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order & Payment Status */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Status Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Status */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Order Status</h3>
                    <div className="text-xs text-muted-foreground mb-2">Current Status</div>
                    <Badge variant="outline" className={`${statusColors[status]} text-xs`}>
                      {status}
                    </Badge>
                  </div>
                  <Select value={status} onValueChange={setStatus} disabled={isUpdating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} disabled={isUpdating || status === order.orderStatus} className="w-full">
                    {isUpdating ? "Updating..." : "Update Status"}
                  </Button>
                </div>

                {/* Payment Status */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Payment Status</h3>
                    <div className="text-xs text-muted-foreground mb-2">Current Status</div>
                    <Badge variant="outline" className={`${paymentStatusColors[paymentStatus]} text-xs`}>
                      {paymentStatus}
                    </Badge>
                  </div>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus} disabled={isUpdatingPayment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handlePaymentStatusUpdate}
                    disabled={isUpdatingPayment || paymentStatus === order.paymentStatus}
                    className="w-full"
                  >
                    {isUpdatingPayment ? "Updating..." : "Update Payment"}
                  </Button>
                  {order.paymentMethod === "cod" && paymentStatus === "pending" && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                      COD payment will be marked as paid when order is delivered
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Name</div>
                <div className="font-medium text-sm">{order.user?.name || "N/A"}</div>
              </div>
              <Separator />
              <div>
                <div className="text-xs text-muted-foreground mb-1">Email</div>
                <a href={`mailto:${order.user?.email}`} className="text-primary hover:underline text-sm">
                  {order.user?.email || "N/A"}
                </a>
              </div>
              {order.user?.phone && (
                <>
                  <Separator />
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Phone</div>
                    <a href={`tel:${order.user.phone}`} className="text-primary hover:underline text-sm">
                      {order.user.phone}
                    </a>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Shipping Address</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1 text-sm">
                <div className="font-medium">{order.shippingAddress.house}, {order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{currencySymbol}{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{currencySymbol}{order.shipping.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{currencySymbol}{order.discount.toFixed(2)}</span>
                  </div>
                  {order.promoCode && (
                    <div className="text-xs text-muted-foreground bg-green-50 p-2 rounded">
                      Promo: <span className="font-medium text-green-700">{order.promoCode}</span>
                    </div>
                  )}
                </>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{currencySymbol}{order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{previewImage?.type}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (previewImage) {
                    try {
                      const response = await fetch(previewImage.url)
                      const blob = await response.blob()
                      const url = window.URL.createObjectURL(blob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = previewImage.name || 'design.png'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      window.URL.revokeObjectURL(url)
                    } catch (error) {
                      console.error('Download failed:', error)
                    }
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {previewImage && (
              <img
                src={previewImage.url}
                alt={previewImage.name}
                className="w-full h-full object-contain"
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">{previewImage?.name}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
