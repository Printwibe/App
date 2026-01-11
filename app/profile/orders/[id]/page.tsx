"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Package, Truck, CheckCircle, Clock } from "lucide-react"

interface OrderItem {
  productId: string
  name: string
  variant: { size: string; color: string }
  quantity: number
  unitPrice: number
  customizationFee: number
  isCustomized: boolean
  customDesign?: { fileUrl: string }
  itemTotal: number
}

interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
  shippingAddress: {
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
  total: number
  createdAt: string
}

const orderSteps = [
  { status: "pending", label: "Order Placed", icon: Clock },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: CheckCircle },
]

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
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
      <Button variant="ghost" asChild>
        <Link href="/profile/orders">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Link>
      </Button>

      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>{order.orderId}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Badge
              className={
                order.orderStatus === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.orderStatus === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }
            >
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Order Progress */}
          {order.orderStatus !== "cancelled" && (
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {orderSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index <= currentStepIndex
                  const isCurrent = index === currentStepIndex
                  return (
                    <div key={step.status} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <p
                        className={`text-xs mt-2 text-center ${
                          isCurrent ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 p-4 border border-border rounded-lg">
                <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                  {item.isCustomized && item.customDesign ? (
                    <Image
                      src={item.customDesign.fileUrl || "/placeholder.svg"}
                      alt="Custom Design"
                      width={80}
                      height={80}
                      className="object-contain rounded-md"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.variant.size} / {item.variant.color}
                  </p>
                  {item.isCustomized && (
                    <Badge variant="outline" className="mt-1">
                      Customized
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">Rs. {item.itemTotal.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping === 0 ? "Free" : `Rs. ${order.shipping}`}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            <p className="text-muted-foreground">
              {order.shippingAddress.house}, {order.shippingAddress.street}
            </p>
            <p className="text-muted-foreground">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-muted-foreground">{order.shippingAddress.country}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
              <p className="text-sm text-muted-foreground">
                Status:{" "}
                <span className={order.paymentStatus === "paid" ? "text-green-600" : "text-yellow-600"}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
