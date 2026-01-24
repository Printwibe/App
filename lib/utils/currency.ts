/**
 * Currency utility functions
 * Only supports Indian Rupees (INR)
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
};

export function getCurrencySymbol(currencyCode: string = "INR"): string {
  return CURRENCY_SYMBOLS[currencyCode] || "₹";
}

export function formatPrice(
  amount: number,
  currencyCode: string = "INR"
): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${amount.toFixed(2)}`;
}

export function formatPriceWithoutSymbol(amount: number): string {
  return amount.toFixed(2);
}
