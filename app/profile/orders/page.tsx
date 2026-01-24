"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Loader2, Package, Eye, Download, Calendar, CreditCard, ShoppingBag } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  isCustomized: boolean
  productImage?: string
  variant?: {
    size: string
    color: string
  }
}

interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
  total: number
  subtotal: number
  orderStatus: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
}

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
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

  if (orders.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-medium">Order History</h2>
          <p className="text-sm text-muted-foreground mt-1">View and manage your orders</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {orders.length} {orders.length === 1 ? "Order" : "Orders"}
        </Badge>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <Link key={order._id} href={`/profile/orders/${order.orderId}`} className="block mb-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="px-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Order Info Section */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{order.orderId}</h3>
                          <Badge variant="outline" className={statusColors[order.orderStatus]}>
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <ShoppingBag className="h-3.5 w-3.5" />
                            {order.items.length} {order.items.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Payment:</span>
                        <span className="font-medium capitalize">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                        </span>
                        <Badge variant="outline" className={paymentStatusColors[order.paymentStatus]}>
                          {order.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="lg:border-l lg:pl-6 flex flex-col justify-between gap-4">
                    <div className="space-y-1 lg:text-right">
                      <p className="text-xs text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">{currencySymbol}{order.total.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-col gap-2 lg:min-w-[160px]">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          window.open(`/api/user/orders/${order.orderId}/invoice`, '_blank')
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
