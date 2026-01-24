"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Product } from "@/lib/types"
import { Minus, Plus, ShoppingCart, Upload, Check, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToastContext } from "@/components/toast/toast-provider"
import { useCurrency } from "@/hooks/use-currency"

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || "")
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || "")
  const [quantity, setQuantity] = useState(1)
  const [wantsCustomization, setWantsCustomization] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customizationData, setCustomizationData] = useState<any>(null)

  const { addToast } = useToastContext()
  const { symbol: currencySymbol } = useCurrency()

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants.map((v) => v.size))]
  const colors = [...new Set(product.variants.map((v) => v.color))]

  // Get current variant stock
  const currentVariant = product.variants.find((v) => v.size === selectedSize && v.color === selectedColor)
  const inStock = currentVariant ? currentVariant.stock > 0 : false

  // Calculate total price
  const totalPrice = product.basePrice + (wantsCustomization ? product.customizationPrice : 0)

  useEffect(() => {
    // Load customization data from sessionStorage
    const storedData = sessionStorage.getItem(`customized-${product._id}`)
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        setCustomizationData(parsed)
        setWantsCustomization(true)
      } catch (error) {
        console.error("Error parsing customization data:", error)
      }
    }
  }, [product._id])

  useEffect(() => {
    const checkCartStatus = async () => {
      try {
        const res = await fetch("/api/cart")
        if (res.ok) {
          const data = await res.json()
          const cartItems = data.cart?.items || []
          const itemInCart = cartItems.some(
            (item: any) =>
              item.productId?.toString() === product._id?.toString() &&
              item.variant?.size === selectedSize &&
              item.variant?.color === selectedColor,
          )
          setIsInCart(itemInCart)
        }
      } catch (error) {
        console.error("Error checking cart status:", error)
      }
    }
    checkCartStatus()
  }, [product._id, selectedSize, selectedColor])

  const handleAddToCart = async () => {
    if (isInCart) {
      router.push("/cart")
      return
    }

    setIsLoading(true)
    
    const cartItem = {
      productId: product._id,
      variant: { size: selectedSize, color: selectedColor },
      quantity,
      isCustomized: wantsCustomization,
      customizationData: customizationData || undefined, // Include customization data
      unitPrice: product.basePrice,
      customizationFee: wantsCustomization ? product.customizationPrice : 0,
    }

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      })

      const data = await res.json()

      if (!res.ok) {
        addToast(data.error || "Failed to add to cart", "error")
      } else {
        addToast("Product added to cart!", "success")
        setIsInCart(true)
        setQuantity(1)
        // Clear customization data from sessionStorage after adding to cart
        if (customizationData) {
          sessionStorage.removeItem(`customized-${product._id}`)
        }
      }
    } catch (error) {
      addToast("Something went wrong. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-card rounded-lg overflow-hidden">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 transition-colors cursor-pointer ${
                    selectedImage === index ? "border-foreground" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} view ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">{product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-medium mb-4">{product.name}</h1>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold">{currencySymbol}{totalPrice.toFixed(2)}</span>
            {wantsCustomization && (
              <span className="text-sm text-muted-foreground">
                (includes {currencySymbol}{product.customizationPrice.toFixed(2)} customization fee)
              </span>
            )}
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <Label>Size</Label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md text-sm transition-colors cursor-pointer ${
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          {colors.length > 1 && (
            <div className="space-y-3">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md text-sm transition-colors cursor-pointer ${
                      selectedColor === color
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.allowCustomization && (
            <div className={`p-4 rounded-lg space-y-3 ${
              customizationData ? 'bg-green-50 dark:bg-green-950 border-2 border-green-500' : 'bg-secondary'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {customizationData ? (
                      <>
                        <Check className="h-5 w-5 text-green-600" />
                        Custom Design Added
                      </>
                    ) : (
                      'Add Custom Design'
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {customizationData ? (
                      `${Object.keys(customizationData.viewDesigns || {}).length} view(s) customized`
                    ) : (
                      `Upload your own artwork (+${currencySymbol}${product.customizationPrice.toFixed(2)})`
                    )}
                  </p>
                </div>
                <Button
                  variant={customizationData ? "default" : "outline"}
                  size="sm"
                  onClick={() => router.push(`/products/${product.slug}/customize`)}
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {customizationData ? 'Edit Design' : 'Customize Design'}
                </Button>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className="cursor-pointer"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                disabled={currentVariant && quantity >= currentVariant.stock}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add to Cart - Updated button to show different state when in cart */}
          <div className="flex gap-4">
            <Button
              size="lg"
              className={`flex-1 cursor-pointer ${isInCart ? "bg-green-600 hover:bg-green-700" : ""}`}
              disabled={!inStock || isLoading}
              onClick={handleAddToCart}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Adding...
                </>
              ) : isInCart ? (
                <>
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Go to Cart
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {inStock ? "Add to Cart" : "Out of Stock"}
                </>
              )}
            </Button>
          </div>

          {/* Stock Info */}
          {currentVariant && inStock && (
            <p className="text-sm text-muted-foreground">{currentVariant.stock} items in stock</p>
          )}

          {/* Breadcrumb */}
          <nav className="pt-6 border-t border-border">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground cursor-pointer">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/products" className="hover:text-foreground cursor-pointer">
                  Products
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  )
}
