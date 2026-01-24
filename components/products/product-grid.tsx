import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { getCurrencySymbol } from "@/lib/utils/currency"

interface ProductGridProps {
  category?: string
  customizable?: string
  search?: string
  page?: string
}

async function getSettings() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/settings`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    if (response.ok) {
      const data = await response.json()
      return data.settings
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
  }
  return { currency: "INR" }
}

async function getProducts(params: ProductGridProps) {
  try {
    const searchParams = new URLSearchParams()

    if (params.category) searchParams.set("category", params.category)
    if (params.customizable) searchParams.set("customizable", params.customizable)
    if (params.search) searchParams.set("search", params.search)
    if (params.page) searchParams.set("page", params.page)

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/products?${searchParams.toString()}`, {
      next: { 
        revalidate: 60,
        tags: ['products']
      }
    })

    if (!response.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function ProductGrid(props: ProductGridProps) {
  const [products, settings] = await Promise.all([
    getProducts(props),
    getSettings()
  ])

  const currencySymbol = getCurrencySymbol(settings.currency)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium">No products found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or search terms to find what you're looking for.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{products.length}</span> product{products.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {product.allowCustomization && (
                    <Badge variant="secondary" className="bg-accent text-accent-foreground">
                      Customizable
                    </Badge>
                  )}
                  {totalStock < 10 && totalStock > 0 && (
                    <Badge variant="secondary" className="bg-destructive/90 text-destructive-foreground">
                      Low Stock
                    </Badge>
                  )}
                  {totalStock === 0 && (
                    <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
                      Out of Stock
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
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="pt-2">
                  <p className="text-lg font-semibold">
                    {currencySymbol}{product.basePrice.toFixed(2)}
                    {product.allowCustomization && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        +{currencySymbol}{product.customizationPrice.toFixed(2)} custom
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
