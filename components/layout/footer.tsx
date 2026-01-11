import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl font-semibold">PrintWibe</h3>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Create your own custom printed products. Upload your designs and bring your ideas to life.
            </p>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Shop</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/products" className="hover:text-primary-foreground transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?category=t-shirt" className="hover:text-primary-foreground transition-colors">
                  T-Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=shirt" className="hover:text-primary-foreground transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/products?category=mug" className="hover:text-primary-foreground transition-colors">
                  Mugs
                </Link>
              </li>
              <li>
                <Link href="/products?category=bottle" className="hover:text-primary-foreground transition-colors">
                  Bottles
                </Link>
              </li>
            </ul>
          </div>

          {/* Account Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Account</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/login" className="hover:text-primary-foreground transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary-foreground transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary-foreground transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/profile/orders" className="hover:text-primary-foreground transition-colors">
                  Order History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="font-medium">Support</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li>
                <Link href="/contact" className="hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-primary-foreground transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-primary-foreground transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} PrintWibe. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/60">
            <Link href="/privacy" className="hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
