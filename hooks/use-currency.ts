"use client"

import { useSettings } from "./use-settings"
import { getCurrencySymbol, formatPrice } from "@/lib/utils/currency"

export function useCurrency() {
  const { settings, isLoading } = useSettings()
  const currencyCode = settings?.currency || "INR"
  const symbol = getCurrencySymbol(currencyCode)

  const format = (amount: number) => {
    return formatPrice(amount, currencyCode)
  }

  return {
    currencyCode,
    symbol,
    format,
    isLoading,
  }
}
