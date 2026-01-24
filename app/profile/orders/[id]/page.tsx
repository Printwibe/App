"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, Truck, CheckCircle, Clock, Download, MapPin, CreditCard, User } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"

interface OrderItem {
  productId: string
  name: string
  variant: { size: string; color: string }
  quantity: number
  unitPrice: number
  customizationFee: number
  isCustomized: boolean
  customDesign?: { fileUrl: string }
  customDesigns?: {
    front?: { fileUrl: string; fileName: string }
    back?: { fileUrl: string; fileName: string }
    wraparound?: { fileUrl: string; fileName: string }
    preview?: { fileUrl: string; fileName: string }
    notes?: string
  }
  productImage?: string
  itemTotal: number
}

interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
  shippingAddress: {
    type: string
    name: string
    phone: string
    house: string
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  paymentMethod: string
  paymentStatus: string
  orderStatus: string
  subtotal: number
  shipping: number
  discount: number
  promoCode?: string
  total: number
  createdAt: string
}

const orderSteps = [
  { status: "pending", label: "Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
]

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-cyan-100 text-cyan-800 border-cyan-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  paid: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
}

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/user/orders/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (error) {
      console.error("Failed to fetch order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order? This action cannot be undone."
    )
    
    if (!confirmCancel) return
    
    setCancelling(true)
    try {
      const res = await fetch(`/api/user/orders/${order.orderId}/cancel`, {
        method: "POST"
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert("Order cancelled successfully")
        fetchOrder() // Refresh order data
      } else {
        alert(data.error || "Failed to cancel order")
      }
    } catch (error) {
      console.error("Failed to cancel order:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button asChild>
            <Link href="/profile/orders">Back to Orders</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentStepIndex = orderSteps.findIndex((s) => s.status === order.orderStatus)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/profile/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          {/* Cancel Order Button - only show for pending/confirmed orders */}
          {order && ["pending", "confirmed"].includes(order.orderStatus) && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/api/user/orders/${order.orderId}/invoice`} target="_blank">
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Order Header Card */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-serif font-medium">{order.orderId}</h1>
                <Badge variant="outline" className={statusColors[order.orderStatus]}>
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>•</span>
                <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                <span>•</span>
                <span className="capitalize">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Paid Online"}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Order Progress */}
        {order.orderStatus !== "cancelled" && (
          <CardContent className="pt-6">
            <div className="relative">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-muted" />
              <div 
                className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                style={{ width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%` }}
              />
              <div className="relative flex items-start justify-between">
                {orderSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  return (
                    <div key={step.status} className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted 
                            ? "bg-primary border-primary text-primary-foreground" 
                            : "bg-background border-muted text-muted-foreground"
                        } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className={`text-xs mt-2 text-center max-w-[80px] ${
                        isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                      }`}>
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

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
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex flex-col gap-2">
                      {/* Show multiple custom designs */}
                      {item.customDesigns?.front && (
                        <div className="relative">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={item.customDesigns.front.fileUrl || "/placeholder.svg"}
                              alt="Front design"
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Front
                          </span>
                        </div>
                      )}
                      {item.customDesigns?.back && (
                        <div className="relative">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={item.customDesigns.back.fileUrl || "/placeholder.svg"}
                              alt="Back design"
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          </div>
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1.5 py-0.5 rounded">
                            Back
                          </span>
                        </div>
                      )}
                      {/* Legacy support */}
                      {!item.customDesigns && item.customDesign && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted">
                          <Image
                            src={item.customDesign.fileUrl || "/placeholder.svg"}
                            alt="Custom Design"
                            width={80}
                            height={80}
                            className="object-cover"
                          />
                        </div>
                      )}
                      {/* Product image fallback */}
                      {!item.customDesigns && !item.customDesign && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.variant.size} • {item.variant.color}
                      </p>
                      {item.isCustomized && (
                        <Badge variant="secondary" className="mt-2 text-xs">
                          Custom Design
                        </Badge>
                      )}
                      {item.customDesigns?.notes && (
                        <div className="mt-2 p-2 bg-muted/50 rounded-lg text-xs">
                          <span className="font-medium">Notes:</span> {item.customDesigns.notes}
                        </div>
                      )}
                      {item.customizationFee > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          + Customization: {currencySymbol}{item.customizationFee.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{currencySymbol}{item.itemTotal.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      <p className="text-xs text-muted-foreground">{currencySymbol}{item.unitPrice.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                <span className="font-medium">
                  {order.shipping === 0 ? "Free" : `${currencySymbol}${order.shipping.toFixed(2)}`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount {order.promoCode && <span className="font-medium">({order.promoCode})</span>}
                  </span>
                  <span className="font-medium">-{currencySymbol}{order.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{currencySymbol}{order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Shipping Address</CardTitle>
                </div>
                <Badge variant="secondary" className="capitalize text-xs">
                  {order.shippingAddress.type || "home"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-1 text-sm">
                <p className="font-semibold">{order.shippingAddress.name}</p>
                <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
                <Separator className="my-2" />
                <p className="text-muted-foreground">
                  {order.shippingAddress.house}, {order.shippingAddress.street}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
                <p className="text-muted-foreground">
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-lg">Payment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium capitalize">
                  {order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline" className={paymentStatusColors[order.paymentStatus]}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
