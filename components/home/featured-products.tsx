import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const featuredProducts = [
  {
    id: "1",
    name: "Classic White Tee",
    slug: "classic-white-tee",
    price: 29.99,
    image: "/white-t-shirt-on-hanger-minimal.jpg",
    category: "T-Shirt",
    customizable: true,
  },
  {
    id: "2",
    name: "Ceramic Mug",
    slug: "ceramic-mug",
    price: 19.99,
    image: "/white-ceramic-mug-on-table-minimal.jpg",
    category: "Mug",
    customizable: true,
  },
  {
    id: "3",
    name: "Sport Bottle",
    slug: "sport-bottle",
    price: 24.99,
    image: "/white-sport-water-bottle-minimal.jpg",
    category: "Bottle",
    customizable: true,
  },
  {
    id: "4",
    name: "Premium Black Tee",
    slug: "premium-black-tee",
    price: 34.99,
    image: "/black-t-shirt-on-hanger-minimal.jpg",
    category: "T-Shirt",
    customizable: true,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">Featured</p>
            <h2 className="font-serif text-3xl md:text-4xl font-medium">Popular Products</h2>
          </div>
          <Link href="/products">
            <Button variant="outline" className="gap-2 bg-transparent">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Link key={product.id} href={`/products/${product.slug}`} className="group">
              <div className="relative aspect-[4/5] bg-card rounded-lg overflow-hidden mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.customizable && (
                  <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                    Customizable
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>
                <h3 className="font-medium group-hover:text-accent transition-colors">{product.name}</h3>
                <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
