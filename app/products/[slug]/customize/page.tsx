"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import type { Product } from "@/lib/types"
import { CustomizeWorkspace } from "@/components/products/customize-workspace"

export default function CustomizePage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setProduct(data.product)
        }
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug])

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Product not found</h2>
            <Button onClick={handleBack}>Go Back</Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with Back Button */}
      <div className="border-b bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{product.name}</h1>
                <p className="text-sm text-muted-foreground">Customize Your Design</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Customize Workspace */}
      <main className="flex-1 overflow-hidden">
        <CustomizeWorkspace 
          product={product}
          onSave={async (designs: any) => {
            // Prepare data - keep full URLs for editing, but minimize for storage
            const lightweightData = {
              viewDesigns: Object.fromEntries(
                Object.entries(designs.viewDesigns || {}).map(([index, view]: [string, any]) => [
                  index,
                  {
                    designId: view.designId,
                    customPosition: view.customPosition,
                  }
                ])
              ),
              designLibrary: (designs.designLibrary || []).map((design: any) => ({
                id: design.id,
                name: design.name,
                url: design.url, // Keep full URL for editing
              })),
              notes: designs.notes,
            }
            
            // Check if editing existing cart item
            const editingIndex = sessionStorage.getItem('editing-cart-item-index')
            
            if (editingIndex !== null) {
              // Update existing cart item
              try {
                const res = await fetch('/api/cart/update-customization', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    itemIndex: parseInt(editingIndex),
                    customizationData: lightweightData
                  })
                })
                
                if (res.ok) {
                  sessionStorage.removeItem('editing-cart-item-index')
                  sessionStorage.removeItem(`customized-${product._id}`)
                  router.push('/cart')
                } else {
                  alert('Failed to update design')
                }
              } catch (error) {
                console.error('Error updating cart item:', error)
                alert('Failed to update design')
              }
            } else {
              // New customization - save to sessionStorage
              try {
                sessionStorage.setItem(`customized-${product._id}`, JSON.stringify(lightweightData))
                router.push(`/products/${params.slug}`)
              } catch (error) {
                console.error("Failed to save to session storage:", error)
                alert("Design saved but couldn't store in browser. Please proceed to add to cart.")
                router.push(`/products/${params.slug}`)
              }
            }
          }}
        />
      </main>
    </div>
  )
}

