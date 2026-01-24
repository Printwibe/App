"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, LogOut, ShoppingBag, Mail, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserDropdownProps {
  isLoggedIn: boolean
  userName?: string
}

export function UserDropdown({ isLoggedIn, userName }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        // Clear any localStorage items
        localStorage.removeItem('auth-token')
        localStorage.removeItem('user')
        
        // Trigger auth change event for real-time UI update
        window.dispatchEvent(new Event('auth-change'))
        
        setIsOpen(false)
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {isLoggedIn ? (
        <Button 
          variant="ghost" 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-2"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {userName ? getInitials(userName) : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline-block text-sm font-medium">
            {userName}
          </span>
          <ChevronDown className="h-4 w-4 hidden md:inline-block" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="relative">
          <User className="h-5 w-5" />
          <span className="sr-only">Account menu</span>
        </Button>
      )}

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
          {isLoggedIn ? (
            <>
              <div className="px-4 py-2 border-b border-border mb-2">
                <p className="text-sm font-medium text-foreground">{userName || "User Account"}</p>
              </div>
              <Link href="/profile">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                  <User className="h-4 w-4" />
                  Profile
                </button>
              </Link>
              <Link href="/profile/orders">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                  My Orders
                </button>
              </Link>
              <Link href="/contact">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                  <Mail className="h-4 w-4" />
                  Contact
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors border-t border-border mt-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                  <User className="h-4 w-4" />
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground flex items-center gap-2 transition-colors">
                  <User className="h-4 w-4" />
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}
