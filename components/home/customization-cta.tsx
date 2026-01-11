import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload, Palette, Truck } from "lucide-react"

const steps = [
  {
    icon: Upload,
    title: "Upload Your Design",
    description: "Upload any image, logo, or artwork you want printed on your product.",
  },
  {
    icon: Palette,
    title: "Customize & Preview",
    description: "Position your design, choose colors and sizes, and preview the final result.",
  },
  {
    icon: Truck,
    title: "We Print & Deliver",
    description: "We carefully print your design and deliver it right to your doorstep.",
  },
]

export function CustomizationCTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">How It Works</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Create your own custom products</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            It&apos;s simple to bring your ideas to life. Follow these three easy steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center">
                <step.icon className="h-7 w-7 text-foreground" />
              </div>
              <h3 className="font-medium text-lg">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/products?customizable=true">
            <Button size="lg" className="px-8">
              Start Creating
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
