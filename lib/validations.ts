import { z } from "zod"

// Auth Schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
})

// Address Schema
export const addressSchema = z.object({
  type: z.enum(["home", "work", "other"]),
  house: z.string().min(1, "House/Flat number is required"),
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  isDefault: z.boolean().optional(),
})

// Product Schemas
export const productVariantSchema = z.object({
  size: z.string(),
  color: z.string(),
  stock: z.number().int().min(0),
  sku: z.string(),
})

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Invalid slug format"),
  description: z.string().min(1, "Description is required"),
  category: z.enum(["t-shirt", "shirt", "mug", "bottle"]),
  basePrice: z.number().positive("Base price must be positive"),
  customizationPrice: z.number().min(0, "Customization price cannot be negative"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  allowCustomization: z.boolean(),
  isActive: z.boolean(),
})

export const updateProductSchema = createProductSchema.partial()

// Cart Schemas
export const addToCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variant: z.object({
    size: z.string(),
    color: z.string(),
  }),
  quantity: z.number().int().positive("Quantity must be positive"),
  isCustomized: z.boolean().optional(),
  customDesignId: z.string().optional(),
  unitPrice: z.number().positive("Unit price must be positive"),
  customizationFee: z.number().min(0).optional(),
})

export const updateCartSchema = z.object({
  productId: z.string().min(1),
  variant: z.object({
    size: z.string(),
    color: z.string(),
  }),
  quantity: z.number().int().positive(),
})

export const removeFromCartSchema = z.object({
  productId: z.string().min(1),
  variant: z.object({
    size: z.string(),
    color: z.string(),
  }),
})

// Order Schemas
export const createOrderSchema = z.object({
  paymentMethod: z.enum(["razorpay", "cod"]),
  shippingInfo: z.object({
    house: z.string().min(1),
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().min(1),
  }),
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
})

// Contact Schema
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").max(15),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000),
})

// Payment Schema
export const createRazorpayOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
})

// Query Params Schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || "1", 10)),
  limit: z.string().optional().transform(val => parseInt(val || "20", 10)),
})

export const productFilterSchema = paginationSchema.extend({
  category: z.enum(["t-shirt", "shirt", "mug", "bottle"]).optional(),
  customizable: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
})

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartInput = z.infer<typeof updateCartSchema>
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type ContactInput = z.infer<typeof contactSchema>
export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>
export type ProductFilterInput = z.infer<typeof productFilterSchema>
