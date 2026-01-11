import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Custom Print On Demand</p>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight text-balance">
            Your imagination,
            <br />
            printed to perfection
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
            Create personalized t-shirts, mugs, bottles and more with your own designs. Premium quality products,
            crafted just for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/products">
              <Button size="lg" className="gap-2 px-8">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/products?customizable=true">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Start Customizing
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
