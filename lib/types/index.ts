import type { ObjectId } from "mongodb"

// User Types
export interface Address {
  type: "home" | "work" | "other"
  house: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface User {
  _id?: ObjectId
  name: string
  email: string
  password: string | null // Nullable for OAuth users
  phone?: string | null
  dob?: Date | null
  role: "user" | "admin"
  status?: "active" | "inactive"
  addresses: Address[]
  // OAuth fields
  provider?: "credentials" | "google" // Authentication provider
  googleId?: string // Google user ID
  image?: string | null // Profile picture from OAuth
  createdAt: Date
  updatedAt: Date
}

// Admin Type for separate admin authentication
export interface Admin {
  _id?: ObjectId
  email: string
  password: string
  role: "admin"
  name: string
  status: "active" | "inactive"
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface ProductVariant {
  size: string
  color: string
  stock: number
  sku: string
}

export interface Product {
  _id?: ObjectId
  name: string
  slug: string
  description: string
  category: "t-shirt" | "shirt" | "mug" | "bottle"
  basePrice: number
  customizationPrice: number
  images: string[]
  variants: ProductVariant[]
  allowCustomization: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Custom Design Types
export interface CustomDesign {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  dimensions: {
    width: number
    height: number
  }
  printArea: {
    x: number
    y: number
    width: number
    height: number
  }
  customPosition?: {
    x: number // percentage from left
    y: number // percentage from top
    width: number // percentage of container
    height: number // percentage of container
    rotation?: number // degrees
  }
  designType?: string // front, back, wraparound, preview
  orderId?: string // Order/saved design identifier
  savedToLibrary?: boolean // If saved to user's library
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  updatedAt: Date
}

// Cart Types
export interface CartItem {
  productId: ObjectId
  variant: {
    size: string
    color: string
  }
  quantity: number
  isCustomized: boolean
  customDesigns?: {
    frontDesignId?: string
    backDesignId?: string
    wraparoundDesignId?: string
    previewDesignId?: string
    notes?: string
  }
  // Temporary local designs (before order confirmation)
  tempDesigns?: {
    front?: {
      preview: string // Base64 preview
      customPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotation?: number
      }
      fileName?: string
      fileType?: string
      isUrl?: boolean // If design is from URL
    }
    back?: {
      preview: string
      customPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotation?: number
      }
      fileName?: string
      fileType?: string
      isUrl?: boolean
    }
    wraparound?: {
      preview: string
      customPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotation?: number
      }
      fileName?: string
      fileType?: string
      isUrl?: boolean
    }
    preview?: {
      preview: string
      customPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotation?: number
      }
      fileName?: string
      fileType?: string
      isUrl?: boolean
    }
    notes?: string
  }
  // New customization data from workspace
  customizationData?: {
    viewDesigns?: Record<number, {
      designId: string
      customPosition: {
        x: number
        y: number
        width: number
        height: number
        rotation: number
      }
    }>
    designLibrary?: Array<{
      id: string
      name: string
      url: string
    }>
    notes?: string
  }
  // Legacy support
  customDesignId?: ObjectId
  unitPrice: number
  customizationFee: number
}

export interface Cart {
  _id?: ObjectId
  userId: ObjectId
  items: CartItem[]
  updatedAt: Date
}

// Order Types
export interface OrderItem {
  productId: ObjectId
  name: string
  variant: {
    size: string
    color: string
  }
  quantity: number
  isCustomized: boolean
  customDesigns?: {
    front?: {
      designId: string
      fileUrl: string
      fileName: string
    }
    back?: {
      designId: string
      fileUrl: string
      fileName: string
    }
    wraparound?: {
      designId: string
      fileUrl: string
      fileName: string
    }
    preview?: {
      designId: string
      fileUrl: string
      fileName: string
    }
    notes?: string
  }
  // Legacy support
  customDesign?: {
    designId: ObjectId
    fileUrl: string
    fileName: string
    printArea: {
      x: number
      y: number
      width: number
      height: number
    }
  }
  unitPrice: number
  customizationFee: number
  itemTotal: number
}

export interface Order {
  _id?: ObjectId
  orderId: string
  userId: ObjectId
  items: OrderItem[]
  shippingAddress: Address
  paymentMethod: "razorpay" | "cod" | "manual_upi" | "manual_qr"
  paymentStatus: "pending" | "paid" | "failed"
  razorpayOrderId?: string
  razorpayPaymentId?: string
  manualPaymentDetails?: {
    transactionId?: string
    screenshotUrl?: string
    method?: "upi" | "qr"
  }
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  shipping: number
  discount: number
  promoCode?: string
  total: number
  createdAt: Date
  updatedAt: Date
}

// Promo Code Types
export interface PromoCode {
  _id?: ObjectId
  code: string
  description: string
  discountType: "percentage" | "fixed"
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  validFrom: Date
  validUntil: Date
  usageLimit: number
  usedCount: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Legal Page Types
export interface LegalPage {
  _id?: ObjectId
  type: "terms" | "privacy"
  title: string
  content: string
  version: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
