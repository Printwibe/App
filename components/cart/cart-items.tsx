"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, Loader2, Edit } from "lucide-react"
import { useToastContext } from "@/components/toast/toast-provider"
import { useCurrency } from "@/hooks/use-currency"

interface CartItemData {
  productId: string
  name: string
  slug: string
  image: string
  variant: { size: string; color: string }
  quantity: number
  isCustomized: boolean
  customDesignUrl?: string
  customizationData?: any
  unitPrice: number
  customizationFee: number
}

export function CartItems() {
  const router = useRouter()
  const [items, setItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToastContext()
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    // Fetch cart from API
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart")
        if (res.ok) {
          const data = await res.json()
          setItems(data.cart?.items || [])
        } else {
          setItems([])
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error)
        addToast("Failed to load cart", "error")
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [addToast])

  const updateQuantity = async (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemIndex: index,
          quantity: newQuantity,
        }),
      })

      if (res.ok) {
        const updatedItems = [...items]
        updatedItems[index].quantity = newQuantity
        setItems(updatedItems)
        addToast("Quantity updated", "success")
        // Trigger event for cart summary to update
        window.dispatchEvent(new Event('cart-updated'))
      } else {
        addToast("Failed to update quantity", "error")
      }
    } catch (error) {
      console.error("Failed to update quantity:", error)
      addToast("Failed to update quantity", "error")
    }
  }

  const removeItem = async (index: number) => {
    try {
      const res = await fetch(`/api/cart?itemIndex=${index}`, {
        method: "DELETE",
      })

      if (res.ok) {
        const updatedItems = items.filter((_, i) => i !== index)
        setItems(updatedItems)
        addToast("Item removed from cart", "success")
        // Trigger event for cart summary to update
        window.dispatchEvent(new Event('cart-updated'))
      } else {
        addToast("Failed to remove item", "error")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      addToast("Failed to remove item", "error")
    }
  }

  const handleEditCustomization = (item: CartItemData, index: number) => {
    // Store customization data and item index in sessionStorage
    if (item.customizationData) {
      sessionStorage.setItem(`customized-${item.productId}`, JSON.stringify(item.customizationData))
      sessionStorage.setItem('editing-cart-item-index', index.toString())
    }
    // Navigate to customize page
    router.push(`/products/${item.slug}/customize`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-lg border border-border">
        <div className="mb-4">
          <svg
            className="mx-auto h-16 w-16 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {items.map((item, index) => (
        <div key={`${item.productId}-${index}`} className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-border">
          {/* Delete Button - Top Right Corner */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-md z-10"
            onClick={() => removeItem(index)}
          >
            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>

          {/* Product Image */}
          <div className="relative w-full h-48 sm:w-32 sm:h-32 rounded-md overflow-hidden bg-muted shrink-0">
            <Image 
              src={item.image || "/placeholder.svg"} 
              alt={item.name} 
              fill 
              className="object-cover"
              sizes="128px"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4">
              <div className="flex-1">
                <Link 
                  href={`/products/${item.slug}`} 
                  className="font-medium text-base sm:text-lg hover:text-primary transition-colors line-clamp-2 pr-8 sm:pr-0"
                >
                  {item.name}
                </Link>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
                  <span className="text-xs sm:text-sm bg-muted px-2 py-1 rounded">
                    Size: {item.variant.size}
                  </span>
                  <span className="text-xs sm:text-sm bg-muted px-2 py-1 rounded">
                    Color: {item.variant.color}
                  </span>
                  {item.isCustomized && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-medium">
                      ✨ Custom Design
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Unit Price: {currencySymbol}{item.unitPrice.toFixed(2)}
                  </p>
                  {item.customizationFee > 0 && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Customization Fee: {currencySymbol}{item.customizationFee.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <p className="font-semibold text-lg sm:text-xl whitespace-nowrap">
                  {currencySymbol}{((item.unitPrice + item.customizationFee) * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                  {currencySymbol}{(item.unitPrice + item.customizationFee).toFixed(2)} × {item.quantity}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 mt-3 sm:mt-4 pt-3 sm:pt-0 border-t sm:border-t-0">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs sm:text-sm text-muted-foreground mr-2">Qty:</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-transparent"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
                <span className="w-10 text-center text-sm sm:text-base font-medium">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-transparent"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Button>
              </div>
              
              {/* Edit Customization Button */}
              {item.isCustomized && item.customizationData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCustomization(item, index)}
                  className="gap-2 w-full sm:w-auto text-xs sm:text-sm"
                >
                  <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Edit Design
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
