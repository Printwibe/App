import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductDetails } from "@/components/products/product-details"
import { notFound } from "next/navigation"
import type { Product } from "@/lib/models/types"

// Mock product data - in production this would come from the database
const mockProducts: Record<string, Product> = {
  "classic-white-tee": {
    name: "Classic White Tee",
    slug: "classic-white-tee",
    description:
      "Our premium cotton t-shirt is perfect for custom prints. Made from 100% organic cotton with a comfortable fit that works for any occasion. The smooth surface provides an ideal canvas for your custom designs.",
    category: "t-shirt",
    basePrice: 29.99,
    customizationPrice: 5.0,
    images: ["/blank-white-t-shirt-product-mockup.jpg", "/white-t-shirt-on-hanger-minimal.jpg"],
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
  "ceramic-coffee-mug": {
    name: "Ceramic Coffee Mug",
    slug: "ceramic-coffee-mug",
    description:
      "Classic 11oz ceramic mug that's dishwasher and microwave safe. The high-quality glaze ensures your custom design stays vibrant wash after wash. Perfect for your morning coffee or tea.",
    category: "mug",
    basePrice: 19.99,
    customizationPrice: 3.0,
    images: ["/white-ceramic-coffee-mug-product-mockup.jpg", "/white-ceramic-mug-on-table-minimal.jpg"],
    variants: [
      { size: "11oz", color: "White", stock: 200, sku: "CCM-11-W" },
      { size: "15oz", color: "White", stock: 150, sku: "CCM-15-W" },
    ],
    allowCustomization: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "sport-water-bottle": {
    name: "Sport Water Bottle",
    slug: "sport-water-bottle",
    description:
      "Stay hydrated in style with our 20oz insulated stainless steel bottle. Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and leak-proof design.",
    category: "bottle",
    basePrice: 24.99,
    customizationPrice: 4.0,
    images: ["/white-water-bottle-product-mockup.jpg", "/white-sport-water-bottle-minimal.jpg"],
    variants: [
      { size: "20oz", color: "White", stock: 100, sku: "SWB-20-W" },
      { size: "20oz", color: "Black", stock: 80, sku: "SWB-20-B" },
    ],
    allowCustomization: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  "premium-black-tee": {
    name: "Premium Black Tee",
    slug: "premium-black-tee",
    description:
      "Premium quality black t-shirt made from soft, breathable cotton. Features a classic fit with reinforced stitching for durability. Your custom designs will pop against the rich black fabric.",
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
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = mockProducts[slug]

  if (!product) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ProductDetails product={product} />
      </main>
      <Footer />
    </div>
  )
}
