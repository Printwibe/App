"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

  const hasActiveFilters = currentCategory || currentCustomizable

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3 text-sm">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => updateFilter("category", currentCategory === category.value ? null : category.value)}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                    currentCategory === category.value
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-3 text-sm">Options</h3>
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

          {hasActiveFilters && (
            <div className="border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
