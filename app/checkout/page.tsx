import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CheckoutForm } from "@/components/checkout/checkout-form"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/30">
        <div className="container mx-auto px-4 py-12">
          <h1 className="font-serif text-3xl md:text-4xl font-medium mb-8">Checkout</h1>
          <CheckoutForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
