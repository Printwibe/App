import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductSearch } from "@/components/products/product-search"
import { Suspense } from "react"
import type { Metadata } from "next"

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    customizable?: string
    search?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
    ? params.category.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : null

  const title = category
    ? `Custom ${category}s - Design Your Own | PrintWibe`
    : "Shop Custom Printed Products | PrintWibe"

  const description = category
    ? `Design and order custom printed ${category.toLowerCase()}s online. Upload your artwork, choose colors, and get premium quality prints delivered fast.`
    : "Browse our full collection of custom printed products. T-shirts, mugs, bottles and more. Upload your designs and create something unique."

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: category ? `/products?category=${params.category}` : "/products",
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams

  // Format category name for display
  const getCategoryTitle = (category?: string) => {
    if (!category) return "All Products"
    const formatted = category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
    return `${formatted}s`
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-medium mb-2">
              {getCategoryTitle(params.category)}
            </h1>
            <p className="text-muted-foreground">
              {params.customizable === "true"
                ? "Products you can customize with your own designs"
                : params.search
                ? `Search results for "${params.search}"`
                : "Browse our collection of customizable products"}
            </p>
          </div>

          <div className="mb-8">
            <Suspense fallback={<div className="h-10 bg-muted rounded animate-pulse" />}>
              <ProductSearch />
            </Suspense>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 shrink-0">
              <ProductFilters currentCategory={params.category} currentCustomizable={params.customizable} />
            </aside>

            <div className="flex-1">
              <Suspense key={`${params.category}-${params.customizable}-${params.search}-${params.page}`} fallback={<ProductGridSkeleton />}>
                <ProductGrid
                  category={params.category}
                  customizable={params.customizable}
                  search={params.search}
                  page={params.page}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
            <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-5 bg-muted rounded w-1/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}
