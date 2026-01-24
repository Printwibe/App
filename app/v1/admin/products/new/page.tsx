"use client"

import { ProductForm } from "@/components/admin/product-form"

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Add New Product</h1>
        <p className="text-muted-foreground mt-1">Create a new product for your store</p>
      </div>

      <ProductForm />
    </div>
  )
}
