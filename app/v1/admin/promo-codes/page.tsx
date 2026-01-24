"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Tag, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/hooks/use-currency"

interface PromoCode {
  _id: string
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  validFrom: string
  validUntil: string
  usageLimit: number
  usedCount: number
  isActive: boolean
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { symbol: currencySymbol, currencyCode } = useCurrency()
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    validFrom: "",
    validUntil: "",
    usageLimit: 100,
    isActive: true,
  })

  useEffect(() => {
    fetchPromoCodes()
  }, [])

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch("/api/admin/promo-codes")
      if (res.ok) {
        const data = await res.json()
        setPromoCodes(data)
      }
    } catch (error) {
      console.error("Failed to fetch promo codes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCode ? `/api/admin/promo-codes/${editingCode._id}` : "/api/admin/promo-codes"
      const method = editingCode ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchPromoCodes()
        setIsDialogOpen(false)
        resetForm()
      } else {
        const data = await res.json()
        alert(data.error || "Failed to save promo code")
      }
    } catch (error) {
      alert("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this promo code?")) return

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" })
      if (res.ok) {
        await fetchPromoCodes()
      }
    } catch (error) {
      console.error("Failed to delete promo code:", error)
    }
  }

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description,
      discountType: code.discountType,
      discountValue: code.discountValue,
      minOrderValue: code.minOrderValue,
      maxDiscount: code.maxDiscount || 0,
      validFrom: new Date(code.validFrom).toISOString().split("T")[0],
      validUntil: new Date(code.validUntil).toISOString().split("T")[0],
      usageLimit: code.usageLimit,
      isActive: code.isActive,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingCode(null)
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      validFrom: "",
      validUntil: "",
      usageLimit: 100,
      isActive: true,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Promo Codes</h1>
          <p className="text-muted-foreground">Manage discount codes for your customers</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Promo Code
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCode ? "Edit Promo Code" : "Add New Promo Code"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2026"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Type *</Label>
                  <select
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })}
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ({currencySymbol})</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summer sale discount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input
                    type="number"
                    min="0"
                    step={formData.discountType === "percentage" ? "1" : "0.01"}
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    placeholder={formData.discountType === "percentage" ? "10" : "100"}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.discountType === "percentage" ? "Discount percentage (0-100)" : `Fixed discount amount in ${currencySymbol}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Min Order Value ({currencySymbol}) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                    placeholder="500"
                    required
                  />
                </div>
              </div>

              {formData.discountType === "percentage" && (
                <div className="space-y-2">
                  <Label>Max Discount ({currencySymbol})</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground">Maximum discount amount (optional, 0 = unlimited)</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valid From *</Label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valid Until *</Label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Usage Limit *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  placeholder="100"
                  required
                />
                <p className="text-xs text-muted-foreground">Maximum number of times this code can be used</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border"
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Active (users can use this code)
                </Label>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingCode ? (
                    "Update Code"
                  ) : (
                    "Add Code"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {promoCodes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Tag className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No promo codes yet</h3>
            <p className="text-muted-foreground mb-4">Create your first discount code for customers</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {promoCodes.map((code) => (
            <Card key={code._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl font-mono">{code.code}</CardTitle>
                      {code.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {code.description && <p className="text-sm text-muted-foreground">{code.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(code)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(code._id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="font-medium">
                      {code.discountType === "percentage" ? `${code.discountValue}%` : `${currencySymbol}${code.discountValue}`}
                      {code.maxDiscount && code.maxDiscount > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">(max {currencySymbol}{code.maxDiscount})</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Order</p>
                    <p className="font-medium">{currencySymbol}{code.minOrderValue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usage</p>
                    <p className="font-medium">
                      {code.usedCount} / {code.usageLimit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid Period</p>
                    <p className="font-medium text-sm">
                      {new Date(code.validFrom).toLocaleDateString()} - {new Date(code.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
