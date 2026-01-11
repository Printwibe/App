"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { UserDropdown } from "./user-dropdown"

export function ProfileHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setUserName(data.user.name)
        } else {
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setIsLoggedIn(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
            PrintWibe
          </Link>

          {/* Right side - Cart and User */}
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <UserDropdown isLoggedIn={isLoggedIn} userName={userName} />
          </div>
        </div>
      </div>
    </header>
  )
}
