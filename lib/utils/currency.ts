/**
 * Currency utility functions
 * Maps currency codes to symbols and formats prices
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  AUD: "A$",
  CAD: "C$",
  JPY: "¥",
}

export function getCurrencySymbol(currencyCode: string = "INR"): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode
}

export function formatPrice(amount: number, currencyCode: string = "INR"): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toFixed(2)}`
}

export function formatPriceWithoutSymbol(amount: number): string {
  return amount.toFixed(2)
}
