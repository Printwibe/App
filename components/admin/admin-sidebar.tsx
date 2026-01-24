"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut, Tag, CreditCard, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/v1/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/v1/admin/products", label: "Products", icon: Package },
  { href: "/v1/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/v1/admin/customers", label: "Customers", icon: Users },
  { href: "/v1/admin/promo-codes", label: "Promo Codes", icon: Tag },
  { href: "/v1/admin/payments", label: "Payment Methods", icon: CreditCard },
  { href: "/v1/admin/legal-pages", label: "Legal Pages", icon: FileText },
  { href: "/v1/admin/settings", label: "Settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    window.location.href = "/login"
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/v1/admin" className="font-serif text-xl font-semibold">
            PrintWibe Admin
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/v1/admin" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}
