"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, Users, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCurrency } from "@/hooks/use-currency"

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
}

interface RecentOrder {
  _id: string
  orderId: string
  total: number
  orderStatus: string
  createdAt: string
  user?: {
    name: string
    email: string
  }
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-cyan-100 text-cyan-800 border-cyan-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch orders (includes stats)
      const ordersResponse = await fetch("/api/v1/admin/orders?limit=5")
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setRecentOrders(ordersData.orders || [])
        
        // Set stats from orders API
        if (ordersData.stats) {
          setStats((prev) => ({
            ...prev,
            totalOrders: ordersData.stats.totalOrders || 0,
            totalRevenue: ordersData.stats.totalRevenue || 0,
          }))
        }
      }

      // Fetch products count
      const productsResponse = await fetch("/api/v1/admin/products")
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        setStats((prev) => ({
          ...prev,
          totalProducts: productsData.pagination?.total || 0,
        }))
      }

      // Fetch users count
      const usersResponse = await fetch("/api/v1/admin/users")
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setStats((prev) => ({
          ...prev,
          totalCustomers: usersData.pagination?.total || 0,
        }))
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const statsData = [
    { label: "Total Products", value: stats.totalProducts, icon: Package },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart },
    { label: "Customers", value: stats.totalCustomers, icon: Users },
    { label: "Revenue", value: `${currencySymbol}${stats.totalRevenue.toFixed(2)}`, icon: DollarSign },
  ]
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-medium">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back to PrintWibe Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <span className="text-muted-foreground">...</span>
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Link href="/v1/admin/orders" className="text-sm text-primary hover:underline">
              View all →
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/20 border-b">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Order Details
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-">
                  {recentOrders.map((order) => (
                    <tr 
                      key={order._id} 
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/v1/admin/orders/${order.orderId}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm">{order.orderId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-sm">{order.user?.name || "Guest"}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {order.user?.email || "N/A"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold">{currencySymbol}{order.total.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`capitalize text-xs font-medium ${statusColors[order.orderStatus]}`}
                        >
                          {order.orderStatus}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-muted-foreground">{getTimeAgo(order.createdAt)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
