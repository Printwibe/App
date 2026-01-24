import Link from "next/link"
import Image from "next/image"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/types"

const categoryNames = [
  { name: "T-Shirts", slug: "t-shirt" },
  { name: "Shirts", slug: "shirt" },
  { name: "Mugs", slug: "mug" },
  { name: "Bottles", slug: "bottle" },
]

// Cache categories data for 5 minutes
let cachedCategories: any[] | null = null
let cacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

async function getCategoriesWithData() {
  // Return cached data if still valid
  const now = Date.now()
  if (cachedCategories && (now - cacheTime) < CACHE_DURATION) {
    return cachedCategories
  }

  try {
    const db = await getDatabase()
    const productsCollection = db.collection<Product>("products")
    
    // Optimize: Get all counts and products in parallel
    const categoryPromises = categoryNames.map(async (category) => {
      const [count, product] = await Promise.all([
        productsCollection.countDocuments({
          category: category.slug as "t-shirt" | "shirt" | "mug" | "bottle",
          isActive: true
        }),
        productsCollection.findOne(
          { 
            category: category.slug as "t-shirt" | "shirt" | "mug" | "bottle",
            isActive: true 
          },
          { projection: { images: 1 } }
        )
      ])
      
      return {
        name: category.name,
        slug: category.slug,
        count,
        image: product?.images?.[0] || "/placeholder.svg"
      }
    })
    
    const categories = await Promise.all(categoryPromises)
    
    // Update cache
    cachedCategories = categories
    cacheTime = now
    
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return categoryNames.map(cat => ({
      ...cat,
      count: 0,
      image: "/placeholder.svg"
    }))
  }
}

export async function CategoriesSection() {
  const categories = await getCategoriesWithData()

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Browse By Category</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium">Find your perfect canvas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square bg-card rounded-lg overflow-hidden"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-wider text-card/80 mb-1">
                  {category.count} Product{category.count !== 1 ? 's' : ''}
                </p>
                <h3 className="font-serif text-2xl font-medium text-card">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
