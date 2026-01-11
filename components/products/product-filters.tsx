"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const categories = [
  { value: "t-shirt", label: "T-Shirts" },
  { value: "shirt", label: "Shirts" },
  { value: "mug", label: "Mugs" },
  { value: "bottle", label: "Bottles" },
]

interface ProductFiltersProps {
  currentCategory?: string
  currentCustomizable?: string
}

export function ProductFilters({ currentCategory, currentCustomizable }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.delete("page") // Reset to page 1
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push("/products")
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => updateFilter("category", currentCategory === category.value ? null : category.value)}
              className={`block w-full text-left text-sm py-1 transition-colors ${
                currentCategory === category.value
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-medium mb-4">Options</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="customizable"
            checked={currentCustomizable === "true"}
            onCheckedChange={(checked) => updateFilter("customizable", checked ? "true" : null)}
          />
          <Label htmlFor="customizable" className="text-sm cursor-pointer">
            Customizable only
          </Label>
        </div>
      </div>

      {(currentCategory || currentCustomizable) && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full bg-transparent">
          Clear filters
        </Button>
      )}
    </div>
  )
}
