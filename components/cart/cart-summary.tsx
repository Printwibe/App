"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CartItem {
  unitPrice: number
  customizationFee: number
  quantity: number
}

export function CartSummary() {
  const [promoCode, setPromoCode] = useState("")
  const [subtotal, setSubtotal] = useState(0)
  const [customizationFees, setCustomizationFees] = useState(0)
  const [itemCount, setItemCount] = useState(0)

  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const res = await fetch("/api/cart")
        if (res.ok) {
          const data = await res.json()
          const items: CartItem[] = data.items || []

          let subTotal = 0
          let customFees = 0
          let count = 0

          items.forEach((item) => {
            subTotal += item.unitPrice * item.quantity
            customFees += item.customizationFee * item.quantity
            count += item.quantity
          })

          setSubtotal(subTotal)
          setCustomizationFees(customFees)
          setItemCount(count)
        }
      } catch (error) {
        console.error("Failed to fetch cart summary:", error)
      }
    }

    fetchCartSummary()
  }, [])

  const shipping = 0 // Free shipping
  const total = subtotal + customizationFees + shipping

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {itemCount === 0 ? (
          <p className="text-sm text-muted-foreground">No items in cart</p>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {customizationFees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customization Fees</span>
                  <span>${customizationFees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-accent">Free</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo" className="text-sm">
                Promo Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code"
                />
                <Button variant="outline" size="sm">
                  Apply
                </Button>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>

            <p className="text-xs text-center text-muted-foreground">Taxes calculated at checkout</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}
