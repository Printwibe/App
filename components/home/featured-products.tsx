import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import type { Product } from "@/lib/types"
import { getCurrencySymbol } from "@/lib/utils/currency"

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/products?limit=8`, {
      next: { 
        revalidate: 300,
        tags: ['products', 'featured']
      }
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await response.json()
    return data.products?.slice(0, 4) || []
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

async function getSettings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/settings`, {
      next: { revalidate: 300 }
    })
    if (!response.ok) return { currency: "INR" }
    return await response.json()
  } catch (error) {
    console.error("Error fetching settings:", error)
    return { currency: "INR" }
  }
}

export async function FeaturedProducts() {
  const [products, settings] = await Promise.all([
    getFeaturedProducts(),
    getSettings()
  ])
  
  const currencySymbol = getCurrencySymbol(settings.currency)

  if (products.length === 0) {
    return null
  }

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
          {products.map((product: Product) => {
            const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0
            
            return (
              <Link key={product.slug} href={`/products/${product.slug}`} className="group">
                <div className="relative aspect-[4/5] bg-muted rounded-lg overflow-hidden mb-4">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-3 left-3">
                    {product.allowCustomization && (
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        Customizable
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {product.category.replace('-', ' ')}
                  </p>
                  <h3 className="font-medium group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-lg font-semibold">
                    {currencySymbol}{product.basePrice.toFixed(2)}
                    {product.allowCustomization && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        +{currencySymbol}{product.customizationPrice.toFixed(2)}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
