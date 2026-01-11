import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Package, ArrowRight } from "lucide-react"

interface OrderSuccessPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function OrderSuccessPage({ searchParams }: OrderSuccessPageProps) {
  const params = await searchParams
  const orderId = params.orderId || "PW-2024-XXXXX"

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div>
              <h1 className="font-serif text-2xl font-medium mb-2">Order Placed Successfully!</h1>
              <p className="text-muted-foreground">
                Thank you for your purchase. We&apos;ll send you an email confirmation shortly.
              </p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Order ID</p>
              <p className="font-mono font-semibold">{orderId}</p>
            </div>

            <div className="flex items-center justify-center gap-3 py-4 border-t border-b border-border">
              <Package className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">
                Estimated delivery: <span className="font-medium">5-7 business days</span>
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/profile/orders" className="block">
                <Button className="w-full gap-2">
                  View Order Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
