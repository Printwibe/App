import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    name: "T-Shirts",
    slug: "t-shirt",
    image: "/blank-white-t-shirt-product-mockup.jpg",
    count: 24,
  },
  {
    name: "Mugs",
    slug: "mug",
    image: "/white-ceramic-coffee-mug-product-mockup.jpg",
    count: 18,
  },
  {
    name: "Bottles",
    slug: "bottle",
    image: "/white-water-bottle-product-mockup.jpg",
    count: 12,
  },
]

export function CategoriesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Browse By Category</p>
          <h2 className="font-serif text-3xl md:text-4xl font-medium">Find your perfect canvas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative aspect-square bg-card rounded-lg overflow-hidden"
            >
              <Image
                src={category.image || "/placeholder.svg"}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-xs uppercase tracking-wider text-card/80 mb-1">{category.count} Products</p>
                <h3 className="font-serif text-2xl font-medium text-card">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
