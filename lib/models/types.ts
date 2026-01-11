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
  password: string
  phone?: string
  dob?: Date
  role: "user" | "admin"
  addresses: Address[]
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
  paymentMethod: "razorpay" | "cod"
  paymentStatus: "pending" | "paid" | "failed"
  razorpayOrderId?: string
  razorpayPaymentId?: string
  orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  subtotal: number
  shipping: number
  total: number
  createdAt: Date
  updatedAt: Date
}
