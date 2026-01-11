"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Package, Settings, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProfileHeader } from "@/components/layout/profile-header"

const profileLinks = [
  { href: "/profile", label: "Account Info", icon: User },
  { href: "/profile/orders", label: "My Orders", icon: Package },
  { href: "/profile/addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/settings", label: "Settings", icon: Settings },
]

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />

      <div className="container mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0">
            <nav className="bg-card rounded-lg border border-border p-4">
              <ul className="space-y-2">
                {profileLinks.map((link) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
