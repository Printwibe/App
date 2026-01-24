"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X, Check } from "lucide-react"
import { useCurrency } from "@/hooks/use-currency"

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
  const [discount, setDiscount] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState("")
  const [promoMessage, setPromoMessage] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)
  const { symbol: currencySymbol } = useCurrency()

  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const res = await fetch("/api/cart")
        if (res.ok) {
          const data = await res.json()
          const items: CartItem[] = data.cart?.items || []

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
    
    // Restore applied promo code from sessionStorage
    const savedPromo = sessionStorage.getItem('appliedPromo')
    if (savedPromo) {
      try {
        const promoData = JSON.parse(savedPromo)
        // Restore the applied promo code state
        setPromoCode(promoData.code)
        setAppliedPromo(promoData.code)
        setDiscount(promoData.discount)
      } catch (e) {
        console.error('Error parsing promo data:', e)
      }
    }
    
    // Listen for cart updates
    const handleCartUpdate = () => fetchCartSummary()
    window.addEventListener('cart-updated', handleCartUpdate)
    
    return () => window.removeEventListener('cart-updated', handleCartUpdate)
  }, [])

  // Revalidate promo code when cart total changes
  useEffect(() => {
    if (appliedPromo && (subtotal > 0 || customizationFees > 0)) {
      revalidatePromoCode()
    }
  }, [subtotal, customizationFees])

  const revalidatePromoCode = async () => {
    try {
      const orderValue = subtotal + customizationFees
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedPromo, orderValue }),
      })

      const data = await res.json()

      if (res.ok) {
        // Promo is still valid, update discount if it changed
        setDiscount(data.discount)
        sessionStorage.setItem('appliedPromo', JSON.stringify({
          code: data.code,
          discount: data.discount
        }))
      } else {
        // Promo is no longer valid, remove it
        setDiscount(0)
        setAppliedPromo("")
        setPromoCode("")
        sessionStorage.removeItem('appliedPromo')
        setPromoMessage(`⚠ Promo code removed: ${data.error || 'No longer valid for current cart value'}`)
        setTimeout(() => setPromoMessage(""), 5000)
      }
    } catch (error) {
      console.error("Failed to revalidate promo code:", error)
    }
  }

  const applyPromoCode = async (code: string = promoCode, showMessage: boolean = true) => {
    if (!code.trim()) return

    setApplyingPromo(true)
    setPromoMessage("")

    try {
      const orderValue = subtotal + customizationFees
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), orderValue }),
      })

      const data = await res.json()

      if (res.ok) {
        setDiscount(data.discount)
        setAppliedPromo(data.code)
        // Store promo code data in sessionStorage for checkout page
        sessionStorage.setItem('appliedPromo', JSON.stringify({
          code: data.code,
          discount: data.discount
        }))
        if (showMessage) {
          setPromoMessage(`✓ ${data.discount > 0 ? `${currencySymbol}${data.discount.toFixed(2)} discount applied!` : 'Code applied'}`)
        }
      } else {
        setDiscount(0)
        setAppliedPromo("")
        sessionStorage.removeItem('appliedPromo')
        if (showMessage) {
          setPromoMessage(data.error || "Invalid promo code")
        }
      }
    } catch (error) {
      setDiscount(0)
      setAppliedPromo("")
      if (showMessage) {
        setPromoMessage("Failed to apply promo code")
      }
    } finally {
      setApplyingPromo(false)
    }
  }

  const removePromoCode = () => {
    setPromoCode("")
    setAppliedPromo("")
    setDiscount(0)
    setPromoMessage("")
    sessionStorage.removeItem('appliedPromo')
  }

  const shipping = 0 // Free shipping
  const total = subtotal + customizationFees + shipping - discount

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
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {customizationFees > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customization Fees</span>
                  <span>{currencySymbol}{customizationFees.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Discount ({appliedPromo})</span>
                  <span className="text-green-600 font-medium">-{currencySymbol}{discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promo" className="text-sm">
                Promo Code
              </Label>
              {appliedPromo ? (
                <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                  <Check className="h-3.5 w-3.5 text-yellow-600" />
                  <span className="flex-1 text-xs font-medium text-yellow-700 dark:text-yellow-500">{appliedPromo}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0.5 text-yellow-600 hover:text-yellow-700"
                    onClick={removePromoCode}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value.toUpperCase())
                        setPromoMessage("")
                      }}
                      placeholder="Enter code"
                      onKeyPress={(e) => e.key === "Enter" && applyPromoCode()}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => applyPromoCode()}
                      disabled={!promoCode.trim() || applyingPromo}
                    >
                      {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {promoMessage && (
                    <p
                      className={`text-xs ${
                        promoMessage.startsWith("✓") ? "text-green-600" : "text-destructive"
                      }`}
                    >
                      {promoMessage}
                    </p>
                  )}
                </>
              )}
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
