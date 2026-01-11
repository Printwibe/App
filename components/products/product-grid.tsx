import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/models/types"

interface ProductGridProps {
  category?: string
  customizable?: string
  search?: string
  page?: string
}

async function getProducts(params: ProductGridProps) {
  const searchParams = new URLSearchParams()

  if (params.category) searchParams.set("category", params.category)
  if (params.customizable) searchParams.set("customizable", params.customizable)
  if (params.search) searchParams.set("search", params.search)
  if (params.page) searchParams.set("page", params.page)

  // For demo purposes, return mock data
  // In production, this would fetch from the API
  const mockProducts: Product[] = [
    {
      name: "Classic White Tee",
      slug: "classic-white-tee",
      description: "Premium cotton t-shirt, perfect for custom prints",
      category: "t-shirt",
      basePrice: 29.99,
      customizationPrice: 5.0,
      images: ["/blank-white-t-shirt-product-mockup.jpg"],
      variants: [
        { size: "S", color: "White", stock: 50, sku: "CWT-S-W" },
        { size: "M", color: "White", stock: 100, sku: "CWT-M-W" },
        { size: "L", color: "White", stock: 75, sku: "CWT-L-W" },
        { size: "XL", color: "White", stock: 30, sku: "CWT-XL-W" },
      ],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Ceramic Coffee Mug",
      slug: "ceramic-coffee-mug",
      description: "11oz ceramic mug, dishwasher safe",
      category: "mug",
      basePrice: 19.99,
      customizationPrice: 3.0,
      images: ["/white-ceramic-coffee-mug-product-mockup.jpg"],
      variants: [
        { size: "11oz", color: "White", stock: 200, sku: "CCM-11-W" },
        { size: "15oz", color: "White", stock: 150, sku: "CCM-15-W" },
      ],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sport Water Bottle",
      slug: "sport-water-bottle",
      description: "20oz insulated stainless steel bottle",
      category: "bottle",
      basePrice: 24.99,
      customizationPrice: 4.0,
      images: ["/white-water-bottle-product-mockup.jpg"],
      variants: [
        { size: "20oz", color: "White", stock: 100, sku: "SWB-20-W" },
        { size: "20oz", color: "Black", stock: 80, sku: "SWB-20-B" },
      ],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Premium Black Tee",
      slug: "premium-black-tee",
      description: "Premium cotton t-shirt in classic black",
      category: "t-shirt",
      basePrice: 34.99,
      customizationPrice: 5.0,
      images: ["/black-t-shirt-on-hanger-minimal.jpg"],
      variants: [
        { size: "S", color: "Black", stock: 40, sku: "PBT-S-B" },
        { size: "M", color: "Black", stock: 80, sku: "PBT-M-B" },
        { size: "L", color: "Black", stock: 60, sku: "PBT-L-B" },
        { size: "XL", color: "Black", stock: 25, sku: "PBT-XL-B" },
      ],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Travel Mug",
      slug: "travel-mug",
      description: "Insulated travel mug with lid",
      category: "mug",
      basePrice: 22.99,
      customizationPrice: 3.5,
      images: ["/white-ceramic-mug-on-table-minimal.jpg"],
      variants: [{ size: "12oz", color: "White", stock: 120, sku: "TM-12-W" }],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Slim Water Bottle",
      slug: "slim-water-bottle",
      description: "Sleek 16oz water bottle",
      category: "bottle",
      basePrice: 19.99,
      customizationPrice: 4.0,
      images: ["/white-sport-water-bottle-minimal.jpg"],
      variants: [{ size: "16oz", color: "White", stock: 90, sku: "SLB-16-W" }],
      allowCustomization: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  // Filter by category if specified
  let filtered = mockProducts
  if (params.category) {
    filtered = filtered.filter((p) => p.category === params.category)
  }
  if (params.customizable === "true") {
    filtered = filtered.filter((p) => p.allowCustomization)
  }

  return filtered
}

export async function ProductGrid(props: ProductGridProps) {
  const products = await getProducts(props)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link key={product.slug} href={`/products/${product.slug}`} className="group">
          <div className="relative aspect-[4/5] bg-card rounded-lg overflow-hidden mb-4">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {product.allowCustomization && (
              <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs px-2 py-1 rounded">
                Customizable
              </span>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{product.category}</p>
            <h3 className="font-medium group-hover:text-accent transition-colors">{product.name}</h3>
            <p className="text-lg font-semibold">
              ${product.basePrice.toFixed(2)}
              {product.allowCustomization && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  (+${product.customizationPrice.toFixed(2)} for custom)
                </span>
              )}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
