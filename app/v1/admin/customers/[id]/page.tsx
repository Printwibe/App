"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Package,
  CreditCard,
  Loader2,
  MapPin,
  User,
} from "lucide-react"
import { formatDate, formatPrice } from "@/lib/utils"

interface CustomerDetails {
  _id: string
  name: string
  email: string
  phone?: string
  status?: "active" | "inactive"
  role: string
  createdAt: string
  addresses?: Array<{
    street: string
    city: string
    state: string
    zipCode: string
    country: string
    isDefault?: boolean
  }>
}

interface Order {
  _id: string
  orderId: string
  userId: string
  items: Array<{
    productId: string
    name: string
    unitPrice: number
    itemTotal: number
    quantity: number
    variant?: {
      size?: string
      color?: string
    }
    isCustomized?: boolean
  }>
  subtotal: number
  discount: number
  shipping: number
  total: number
  orderStatus: string
  paymentStatus: string
  paymentMethod?: string
  promoCode?: string
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: string
  updatedAt: string
}

interface OrderStats {
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  const [customer, setCustomer] = useState<CustomerDetails | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails()
      fetchCustomerOrders()
    }
  }, [customerId])

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/v1/admin/users/${customerId}`)
      if (!response.ok) throw new Error("Failed to fetch customer details")
      const data = await response.json()
      setCustomer(data.user)
    } catch (error) {
      console.error("Error fetching customer details:", error)
      alert("Failed to load customer details")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerOrders = async () => {
    try {
      const response = await fetch(`/api/v1/admin/orders?userId=${customerId}`)
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      
      // Calculate stats
      const customerOrders = data.orders || []
      const totalSpent = customerOrders.reduce((sum: number, order: Order) => sum + order.total, 0)
      const totalOrders = customerOrders.length
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0

      setOrders(customerOrders)
      setStats({
        totalOrders,
        totalSpent,
        averageOrderValue,
      })
    } catch (error) {
      console.error("Error fetching customer orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800"
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-cyan-100 text-cyan-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  const getPaymentStatusColor = (status: string) => {
    if (!status) return "bg-gray-100 text-gray-800"
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    }
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isActive = customer.status === "active" || !customer.status
  const latestOrder = orders.length > 0 ? orders[0] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="font-serif text-3xl font-medium">{customer.name}</h1>
            <p className="text-muted-foreground mt-1">Customer Details</p>
          </div>
        </div>
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per order average</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Information */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-muted-foreground">{customer.name}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <a
                  href={`mailto:${customer.email}`}
                  className="text-sm text-primary hover:underline"
                >
                  {customer.email}
                </a>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                {customer.phone ? (
                  <a
                    href={`tel:${customer.phone}`}
                    className="text-sm text-primary hover:underline"
                  >
                    {customer.phone}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">Not provided</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Customer Since</p>
                <p className="text-sm text-muted-foreground">{formatDate(customer.createdAt)}</p>
              </div>
            </div>

            {customer.addresses && customer.addresses.length > 0 && (
              <>
                <Separator />
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Default Address</p>
                    {customer.addresses.map((address, index) => {
                      if (address.isDefault || index === 0) {
                        return (
                          <div key={index} className="text-sm text-muted-foreground mt-1">
                            <p>{address.street}</p>
                            <p>
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p>{address.country}</p>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Latest Order & Order History */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Latest Order Highlight */}
                {latestOrder && (
                  <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-primary">Latest Order</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDate(latestOrder.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{formatPrice(latestOrder.total)}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(latestOrder.orderStatus)}`}>
                            {latestOrder.orderStatus}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(latestOrder.paymentStatus)}`}>
                            {latestOrder.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Items ({latestOrder.items.length})</p>
                        <button
                          onClick={() => router.push(`/v1/admin/orders/${latestOrder.orderId}`)}
                          className="text-sm text-primary underline hover:text-primary/80 cursor-pointer"
                        >
                          View Order Details
                        </button>
                      </div>
                      {latestOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-medium">{formatPrice(item.itemTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Orders Table */}
                <div>
                  <h3 className="text-sm font-medium mb-3">All Orders ({orders.length})</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Order #</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Items</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr
                            key={order._id}
                            className="border-t hover:bg-muted/30 cursor-pointer"
                            onClick={() => router.push(`/v1/admin/orders/${order.orderId}`)}
                          >
                            <td className="py-2 px-3 text-sm font-medium">{order.orderId}</td>
                            <td className="py-2 px-3 text-sm text-muted-foreground">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="py-2 px-3 text-sm text-muted-foreground">
                              {order.items.length} item(s)
                            </td>
                            <td className="py-2 px-3 text-sm font-medium">{formatPrice(order.total)}</td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
