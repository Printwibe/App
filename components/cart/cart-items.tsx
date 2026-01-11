"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, Loader2 } from "lucide-react"
import { useToastContext } from "@/components/toast/toast-provider"

interface CartItemData {
  productId: string
  name: string
  image: string
  variant: { size: string; color: string }
  quantity: number
  isCustomized: boolean
  customDesignUrl?: string
  unitPrice: number
  customizationFee: number
}

export function CartItems() {
  const [items, setItems] = useState<CartItemData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addToast } = useToastContext()

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
      } else {
        addToast("Failed to remove item", "error")
      }
    } catch (error) {
      console.error("Failed to remove item:", error)
      addToast("Failed to remove item", "error")
    }
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
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Your cart is empty</p>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={`${item.productId}-${index}`} className="flex gap-4 p-4 bg-card rounded-lg border border-border">
          {/* Product Image */}
          <div className="relative w-24 h-24 rounded-md overflow-hidden bg-muted shrink-0">
            <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            {item.isCustomized && item.customDesignUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-8 h-8">
                  <Image
                    src={item.customDesignUrl || "/placeholder.svg"}
                    alt="Custom design"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-4">
              <div>
                <Link href={`/products/${item.productId}`} className="font-medium hover:text-accent transition-colors">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.variant.size} / {item.variant.color}
                </p>
                {item.isCustomized && (
                  <span className="inline-block mt-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded">
                    Custom Design
                  </span>
                )}
              </div>
              <p className="font-semibold whitespace-nowrap">
                ${((item.unitPrice + item.customizationFee) * item.quantity).toFixed(2)}
              </p>
            </div>

            <div className="flex items-center justify-between mt-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 bg-transparent"
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
