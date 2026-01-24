"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce"

export function ProductSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentSearch = searchParams.get("search") || ""
  const [searchValue, setSearchValue] = useState(currentSearch)
  const [isSearching, setIsSearching] = useState(false)
  const debouncedSearch = useDebounce(searchValue, 500)

  // Sync with URL on mount and when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search") || ""
    if (urlSearch !== searchValue) {
      setSearchValue(urlSearch)
    }
  }, [searchParams])

  // Trigger search when debounced value changes
  useEffect(() => {
    // Skip on initial mount
    if (debouncedSearch === currentSearch) return

    setIsSearching(true)
    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim())
    } else {
      params.delete("search")
    }

    params.delete("page") // Reset to page 1
    router.push(`/products?${params.toString()}`)

    // Small delay to show loading state
    const timeout = setTimeout(() => setIsSearching(false), 300)
    return () => clearTimeout(timeout)
  }, [debouncedSearch])

  const clearSearch = () => {
    setSearchValue("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("search")
    params.delete("page")
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search products..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10 pr-20"
        disabled={isSearching}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {isSearching && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Searching...</span>
          </div>
        )}
        {searchValue && !isSearching && (
          <button
            type="button"
            onClick={clearSearch}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
