"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Eye, UserCheck, UserX, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDate, formatPrice } from "@/lib/utils"

interface Customer {
  _id: string
  name: string
  email: string
  phone?: string
  status?: "active" | "inactive"
  role: string
  createdAt: string
  totalOrders?: number
}

export default function CustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; action: "activate" | "deactivate" } | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, filterStatus])

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/v1/admin/users?limit=100")
      if (!response.ok) throw new Error("Failed to fetch customers")
      
      const data = await response.json()
      setCustomers(data.users || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = 
        filterStatus === "all" || 
        (filterStatus === "active" && (customer.status === "active" || !customer.status)) ||
        (filterStatus === "inactive" && customer.status === "inactive")
      return matchesSearch && matchesStatus
    })
    setFilteredCustomers(filtered)
  }

  const handleStatusChange = async (userId: string, newStatus: "active" | "inactive") => {
    try {
      setActionLoading(userId)
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update user status")

      // Update local state
      setCustomers((prev) =>
        prev.map((customer) =>
          customer._id === userId ? { ...customer, status: newStatus } : customer
        )
      )
      setDialogOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Failed to update user status")
    } finally {
      setActionLoading(null)
    }
  }

  const openConfirmDialog = (userId: string, name: string, action: "activate" | "deactivate") => {
    setSelectedUser({ id: userId, name, action })
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
        <div className="ml-auto text-sm text-muted-foreground">
          {filteredCustomers.length} customer(s)
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => {
                    const isActive = customer.status === "active" || !customer.status
                    return (
                      <tr key={customer._id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{customer.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{customer.email}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{customer.phone || "N/A"}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {formatDate(customer.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/v1/admin/customers/${customer._id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {isActive ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConfirmDialog(customer._id, customer.name, "deactivate")}
                                disabled={actionLoading === customer._id}
                              >
                                {actionLoading === customer._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserX className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openConfirmDialog(customer._id, customer.name, "activate")}
                                disabled={actionLoading === customer._id}
                              >
                                {actionLoading === customer._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserCheck className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.action === "activate" ? "Activate" : "Deactivate"} Customer
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedUser?.action} <strong>{selectedUser?.name}</strong>?
              {selectedUser?.action === "deactivate" && (
                <span className="block mt-2 text-destructive">
                  This will prevent them from logging in and placing orders.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser) {
                  handleStatusChange(
                    selectedUser.id,
                    selectedUser.action === "activate" ? "active" : "inactive"
                  )
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
