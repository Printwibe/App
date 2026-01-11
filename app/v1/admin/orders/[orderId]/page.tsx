"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download, Printer } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

// Mock order data - replace with API call
const mockOrder = {
  id: "PW-2024-00156",
  customer: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
  },
  shippingAddress: {
    house: "123",
    street: "Main Street",
    city: "San Francisco",
    state: "CA",
    postalCode: "94105",
    country: "United States",
  },
  items: [
    {
      id: 1,
      name: "Custom T-Shirt",
      variant: "Large / White",
      quantity: 2,
      price: 29.99,
      hasCustomDesign: true,
      customDesignUrl: "/custom-t-shirt-design.jpg",
    },
    {
      id: 2,
      name: "Coffee Mug",
      variant: "11oz",
      quantity: 1,
      price: 14.99,
      hasCustomDesign: false,
    },
  ],
  subtotal: 74.97,
  shipping: 15.0,
  total: 89.97,
  status: "processing",
  paymentMethod: "razorpay",
  paymentStatus: "paid",
  razorpayPaymentId: "pay_abc123xyz789",
  orderDate: "Nov 29, 2024",
  createdAt: "2024-11-29T10:30:00Z",
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.orderId
  const [order, setOrder] = useState(mockOrder)
  const [status, setStatus] = useState(mockOrder.status)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/v1/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        const data = await response.json()
        setOrder({ ...order, status })
        alert("Order status updated successfully!")
      } else {
        alert("Failed to update order status")
        setStatus(order.status)
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
      alert("Error updating order status")
      setStatus(order.status)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/v1/admin/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-medium">Order {order.id}</h1>
          <p className="text-muted-foreground mt-1">{order.orderDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                    {item.hasCustomDesign && (
                      <img
                        src={item.customDesignUrl || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.variant}</div>
                      {item.hasCustomDesign && (
                        <span className="inline-block mt-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                          Custom Design
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm">Qty: {item.quantity}</div>
                      <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  {order.shippingAddress.house}, {order.shippingAddress.street}
                </div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </div>
                <div>{order.shippingAddress.country}</div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    order.paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.paymentStatus.toUpperCase()}
                </span>
              </div>
              {order.razorpayPaymentId && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="font-medium">{order.customer.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <a href={`mailto:${order.customer.email}`} className="text-primary hover:underline text-sm">
                  {order.customer.email}
                </a>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <a href={`tel:${order.customer.phone}`} className="text-primary hover:underline text-sm">
                  {order.customer.phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status]}`}
                >
                  {status.toUpperCase()}
                </span>
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
              <Button onClick={handleStatusUpdate} disabled={isUpdating || status === order.status} className="w-full">
                {isUpdating ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-border pt-3">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
