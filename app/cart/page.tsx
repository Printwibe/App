import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CartItems } from "@/components/cart/cart-items"
import { CartSummary } from "@/components/cart/cart-summary"

export default function CartPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CartItems />
            </div>
            <div>
              <CartSummary />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
