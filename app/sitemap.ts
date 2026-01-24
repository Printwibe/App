import type { MetadataRoute } from "next"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/types"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ]

  // Dynamic product routes
  try {
    const db = await getDatabase()
    const products = await db
      .collection<Product>("products")
      .find({ isActive: true })
      .project({ slug: 1, updatedAt: 1 })
      .toArray()

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }))

    return [...staticRoutes, ...productRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    return staticRoutes
  }
}
