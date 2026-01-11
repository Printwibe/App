import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye } from "lucide-react"
import Link from "next/link"

const orders = [
  {
    id: "PW-2024-00156",
    customer: "John Doe",
    email: "john@example.com",
    total: 89.97,
    status: "processing",
    items: 3,
    date: "Nov 29, 2024",
    hasCustomDesign: true,
  },
  {
    id: "PW-2024-00155",
    customer: "Jane Smith",
    email: "jane@example.com",
    total: 54.98,
    status: "shipped",
    items: 2,
    date: "Nov 29, 2024",
    hasCustomDesign: false,
  },
  {
    id: "PW-2024-00154",
    customer: "Mike Johnson",
    email: "mike@example.com",
    total: 124.95,
    status: "delivered",
    items: 5,
    date: "Nov 28, 2024",
    hasCustomDesign: true,
  },
  {
    id: "PW-2024-00153",
    customer: "Sarah Wilson",
    email: "sarah@example.com",
    total: 29.99,
    status: "pending",
    items: 1,
    date: "Nov 28, 2024",
    hasCustomDesign: false,
  },
  {
    id: "PW-2024-00152",
    customer: "Tom Brown",
    email: "tom@example.com",
    total: 74.97,
    status: "confirmed",
    items: 3,
    date: "Nov 27, 2024",
    hasCustomDesign: true,
  },
]

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage customer orders</p>
        </div>
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-medium">{order.id}</span>
                        {order.hasCustomDesign && (
                          <span className="ml-2 text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">Custom</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.items} items</td>
                    <td className="py-3 px-4 text-sm font-medium">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end">
                        <Link href={`/v1/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
