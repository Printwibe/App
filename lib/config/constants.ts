// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
} as const

// Payment Methods
export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  COD: "cod",
} as const

// Product Categories
export const PRODUCT_CATEGORIES = {
  T_SHIRT: "t-shirt",
  SHIRT: "shirt",
  MUG: "mug",
  BOTTLE: "bottle",
} as const

// User Roles
export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
} as const

// Address Types
export const ADDRESS_TYPES = {
  HOME: "home",
  WORK: "work",
  OTHER: "other",
} as const

// Custom Design Status
export const DESIGN_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const

// Admin Status
export const ADMIN_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const

// File Upload Limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 100,
} as const

// JWT Expiry
export const JWT_EXPIRY = {
  USER: "30d",
  ADMIN: "7d",
} as const

// Shipping
export const SHIPPING = {
  FREE_SHIPPING_THRESHOLD: 499,
  DEFAULT_SHIPPING_COST: 49,
} as const

// Price Formatting
export const CURRENCY = {
  SYMBOL: "₹",
  CODE: "INR",
} as const
