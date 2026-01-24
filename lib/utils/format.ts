import { CURRENCY } from "@/lib/config/constants"

/**
 * Format price to INR currency
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY.SYMBOL}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${Math.round(bytes / Math.pow(k, i) * 100) / 100} ${sizes[i]}`
}

/**
 * Format phone number
 */
export function formatPhone(phone: string): string {
  // Format to +91-XXXXX-XXXXX
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+91-${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format order ID
 */
export function formatOrderId(orderId: string): string {
  return `#${orderId.toUpperCase()}`
}
