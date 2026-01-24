"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { UserDropdown } from "./user-dropdown"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")
  const [cartCount, setCartCount] = useState(0)

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setIsLoggedIn(true)
        setUserName(data.user.name)
      } else {
        setIsLoggedIn(false)
        setUserName("")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsLoggedIn(false)
      setUserName("")
    }
  }

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        const items = data.cart?.items || []
        const totalCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
        setCartCount(totalCount)
      } else {
        setCartCount(0)
      }
    } catch (error) {
      console.error("Failed to fetch cart count:", error)
      setCartCount(0)
    }
  }

  useEffect(() => {
    checkAuth()
    fetchCartCount()

    // Listen for custom auth change events
    const handleAuthChange = () => {
      checkAuth()
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener('auth-change', handleAuthChange)
    window.addEventListener('cart-updated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      window.removeEventListener('cart-updated', handleCartUpdate)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
            PrintWibe
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm font-medium hover:text-accent transition-colors">
              Shop
            </Link>
            <Link href="/products?category=t-shirt" className="text-sm font-medium hover:text-accent transition-colors">
              T-Shirts
            </Link>
            <Link href="/products?category=mug" className="text-sm font-medium hover:text-accent transition-colors">
              Mugs
            </Link>
            <Link href="/products?category=bottle" className="text-sm font-medium hover:text-accent transition-colors">
              Bottles
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-accent transition-colors">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold text-white bg-primary rounded-full border-2 border-background">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
                <span className="sr-only">Cart ({cartCount} items)</span>
              </Button>
            </Link>
            <UserDropdown isLoggedIn={isLoggedIn} userName={userName} />
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/products"
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop All
              </Link>
              <Link
                href="/products?category=t-shirt"
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                T-Shirts
              </Link>
              <Link
                href="/products?category=mug"
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mugs
              </Link>
              <Link
                href="/products?category=bottle"
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Bottles
              </Link>
              <Link
                href="/contact"
                className="text-sm font-medium hover:text-accent transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
