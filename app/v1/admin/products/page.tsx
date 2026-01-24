"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/utils"

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/v1/admin/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error("Error fetching products:", error)
      alert("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (productId: string) => {
    setDeleteLoading(productId)
    try {
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete product")

      // Remove from local state
      setProducts(products.filter((p) => p._id?.toString() !== productId))
      setDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product")
    } finally {
      setDeleteLoading(null)
    }
  }

  const openDeleteDialog = (productId: string, productName: string) => {
    setSelectedProduct({ id: productId, name: productName })
    setDialogOpen(true)
  }

  const getTotalStock = (product: Product) => {
    if (!product.variants || product.variants.length === 0) return 0
    return product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Link href="/v1/admin/products/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No products yet</p>
              <Link href="/v1/admin/products/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Product</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id?.toString()} className="border-b border-border last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                No Image
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{product.category}</td>
                      <td className="py-3 px-4 text-sm">{formatPrice(product.basePrice)}</td>
                      <td className="py-3 px-4 text-sm">{getTotalStock(product)} units</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/v1/admin/products/${product._id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => openDeleteDialog(product._id!.toString(), product.name)}
                            disabled={deleteLoading === product._id?.toString()}
                          >
                            {deleteLoading === product._id?.toString() ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedProduct) {
                  handleDelete(selectedProduct.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
