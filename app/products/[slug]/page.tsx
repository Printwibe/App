import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { notFound } from "next/navigation"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/types"
import type { Metadata } from "next"

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const db = await getDatabase()
    const product = await db.collection<Product>("products").findOne({
      slug,
      isActive: true
    })
    
    if (!product) return null
    
    // Serialize MongoDB objects to plain JSON
    return {
      ...product,
      _id: product._id?.toString(),
      createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
      updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    } as any
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return {
      title: "Product Not Found | PrintWibe",
    }
  }

  const image = product.images?.[0] || "/placeholder.png"

  return {
    title: `${product.name} - Custom Printed | PrintWibe`,
    description: product.description || `Order custom printed ${product.name} online. Upload your design and get premium quality prints delivered to your door.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [image],
      url: `/products/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  // Serialize for client component
  const serializedProduct = JSON.parse(JSON.stringify(product))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductDetails product={serializedProduct} />
      </main>
      <Footer />
    </div>
  )
}
