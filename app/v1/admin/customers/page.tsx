"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye, Mail } from "lucide-react"

// Mock customers data - replace with API call
const customers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    totalOrders: 5,
    totalSpent: 289.95,
    joinDate: "Aug 15, 2024",
    status: "active",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 234-5678",
    totalOrders: 3,
    totalSpent: 154.97,
    joinDate: "Sep 20, 2024",
    status: "active",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    phone: "+1 (555) 345-6789",
    totalOrders: 8,
    totalSpent: 624.75,
    joinDate: "Jul 10, 2024",
    status: "active",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    phone: "+1 (555) 456-7890",
    totalOrders: 2,
    totalSpent: 89.98,
    joinDate: "Oct 05, 2024",
    status: "inactive",
  },
  {
    id: 5,
    name: "Tom Brown",
    email: "tom@example.com",
    phone: "+1 (555) 567-8901",
    totalOrders: 12,
    totalSpent: 959.88,
    joinDate: "Jun 01, 2024",
    status: "active",
  },
]

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || customer.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Customers</h1>
        <p className="text-muted-foreground mt-1">Manage your customers</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Orders</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total Spent</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <div className="font-medium">{customer.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`mailto:${customer.email}`} className="text-primary hover:underline text-sm">
                        {customer.email}
                      </a>
                    </td>
                    <td className="py-3 px-4">
                      <a href={`tel:${customer.phone}`} className="text-primary hover:underline text-sm">
                        {customer.phone}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-sm">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-sm font-medium">${customer.totalSpent.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{customer.joinDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Mail className="h-4 w-4" />
                        </Button>
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
