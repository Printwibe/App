# PrintWibe — AI Agent Development Instructions

## Project Overview

**PrintWibe** is a full-stack custom print e-commerce platform built with Next.js 15, MongoDB, and modern web technologies. Users can browse products (t-shirts, shirts, mugs, bottles), upload custom designs, manage cart, checkout with Razorpay/COD, and track orders. Admins have a separate authentication system and dashboard for product/order/customer management.

**Key Tech Stack:**
- **Framework:** Next.js 15 (App Router, React 19)
- **Database:** MongoDB (native driver)
- **Auth:** JWT tokens in HTTP-only cookies (separate for users & admins)
- **Payments:** Razorpay integration
- **File Storage:** Vercel Blob for design uploads
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)

---

## Architecture & Key Conventions

### 1. Next.js App Router Patterns

**Server Components (Default):**
- Most pages in `app/` are server components by default
- Direct database access is allowed in server components
- Use `async` functions and `await` for data fetching
- Example: `app/page.tsx`, `app/products/page.tsx`

**Client Components:**
- Components with `"use client"` directive at the top
- Required for: interactivity, hooks (useState, useEffect), event handlers
- All `components/ui/*` are client components (shadcn/ui pattern)
- Interactive forms and user interactions live here
- Example: `components/auth/login-form.tsx`, `components/layout/header.tsx`

**Component Organization:**
```
components/
├── ui/              # shadcn/ui primitives (client components)
├── layout/          # Header, Footer, navigation
├── home/            # Homepage sections
├── products/        # Product-related components
├── cart/            # Cart components
├── checkout/        # Checkout flow
├── admin/           # Admin-specific components
├── auth/            # Login/register forms
└── toast/           # Toast notification system
```

### 2. Database Architecture

**Connection Management:**
- Single MongoDB connection via `lib/mongodb.ts`
- Connection pooling handled automatically
- Always use `getDatabase()` or `connectDB()` to get DB instance
- Database name: `printwibe`

**Model Operations Pattern:**
- `lib/models.ts` provides collection helpers (Order, User, Product, Cart)
- Each model exposes: `collection()`, `findOne()`, `findById()`, `find()`, `insertOne()`, `updateOne()`
- Use `ObjectId` from `mongodb` for ID conversions
- Example: `const order = await Order.findById(id)`

**Collections Schema:**
```javascript
users: { _id, name, email, password, phone, dob, role, addresses[], createdAt, updatedAt }
admins: { _id, email, password, name, role: "admin", status, createdAt, updatedAt }
products: { _id, name, slug, description, category, basePrice, customizationPrice, images[], variants[], allowCustomization, isActive, createdAt, updatedAt }
carts: { _id, userId, items[{productId, variant, quantity, isCustomized, customDesignId, unitPrice, customizationFee}], updatedAt }
orders: { _id, orderId, userId, items[], shippingAddress, paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId, orderStatus, subtotal, shipping, total, createdAt, updatedAt }
customDesigns: { _id, userId, productId, fileName, fileUrl, fileType, fileSize, dimensions, printArea, status, createdAt, updatedAt }
contacts: { _id, name, email, phone, subject, message, status, createdAt }
```

**TypeScript Types:**
- All types defined in `lib/models/types.ts`
- Import and use these types: `User`, `Admin`, `Product`, `Cart`, `Order`, `CartItem`, `OrderItem`, `CustomDesign`
- Always type collection operations: `db.collection<Product>('products')`

### 3. Authentication & Authorization

**Dual Authentication System:**

**User Authentication:**
- Cookie name: `auth-token`
- JWT secret: `JWT_SECRET` from env
- Helper functions in `lib/auth.ts`:
  - `getCurrentUser()` - Get authenticated user
  - `generateToken(userId, role)` - Create JWT
  - `verifyToken(token)` - Verify JWT
  - `hashPassword(password)` - Hash with bcrypt
  - `verifyPassword(password, hash)` - Compare passwords

**Admin Authentication (Separate System):**
- Cookie name: `admin-token`
- JWT secret: `ADMIN_JWT_SECRET` from env
- Separate `admins` collection (NOT users with role="admin")
- Helper functions:
  - `getCurrentAdmin()` - Get authenticated admin
  - `generateAdminToken(adminId)` - Create admin JWT
  - `verifyAdminToken(token)` - Verify admin JWT
  - `isAdminAuthenticated()` - Check if admin logged in

**Route Protection (middleware.ts):**
- User routes: `/profile/*`, `/checkout/*` require `auth-token`
- Admin routes: `/v1/admin/*` require `admin-token` (except `/v1/admin/login`)
- Auth pages redirect if already logged in
- **IMPORTANT:** Middleware only checks cookie presence, NOT roles

**API Route Protection Pattern:**
```typescript
// User endpoint
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... user logic
}

// Admin endpoint
export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... admin logic
}
```

### 4. API Routes Architecture

**Naming Convention:**
- User APIs: `/api/auth/*`, `/api/products/*`, `/api/cart/*`, `/api/orders/*`, `/api/user/*`
- Admin APIs: `/api/v1/admin/*`

**Standard Response Pattern:**
```typescript
// Success
return NextResponse.json({ data, message: "Success" }, { status: 200 })

// Error
return NextResponse.json({ error: "Error message" }, { status: 4xx/5xx })

// With pagination
return NextResponse.json({
  items,
  pagination: { page, limit, total, pages }
})
```

**Query Parameters Pattern:**
- Pagination: `page` (default: 1), `limit` (default: 20)
- Filtering: `category`, `customizable`, `search`, `status`
- Example: `/api/products?category=t-shirt&page=1&limit=20`

**Error Handling:**
```typescript
try {
  // logic
} catch (error) {
  console.error("Context error:", error)
  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}
```

### 5. File Uploads (Vercel Blob)

**Implementation in `/api/upload/route.ts`:**
- Accepts: PNG, JPG, JPEG, SVG
- Max size: 5MB
- Uses `@vercel/blob` `put()` method
- Stores metadata in `customDesigns` collection
- Returns: `{ designId, fileUrl }`

**Client-side upload:**
```typescript
const formData = new FormData()
formData.append('file', file)
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
})
```

### 6. Payment Integration (Razorpay)

**Server-side (`/api/payments/razorpay/route.ts`):**
- Create order: Uses `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Returns razorpay order ID

**Client-side:**
- Use `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- Load Razorpay SDK and handle payment

**Payment Methods:**
- `razorpay` - Online payment via Razorpay
- `cod` - Cash on Delivery (no Razorpay interaction)

### 7. Styling & UI Components

**Utility Function:**
- `cn()` from `lib/utils.ts` - Merges Tailwind classes using `clsx` + `tailwind-merge`
- Use this for conditional classes and component variants

**shadcn/ui Pattern:**
- All UI components use Radix UI primitives
- Styled with Tailwind CSS
- Support variants via `class-variance-authority` (cva)
- Example: `components/ui/button.tsx`, `components/ui/card.tsx`

**Styling Conventions:**
- Use Tailwind utility classes
- Font: Geist (sans), Geist Mono (mono), Playfair Display (serif)
- Theme support via `next-themes`
- Toast notifications via custom implementation (`components/toast/*`)

---

## Development Guidelines for Agents

### Adding New Features

**1. New API Endpoint:**
```typescript
// app/api/example/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const data = await db.collection("collectionName").find({}).toArray()

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Example error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
```

**2. New Page:**
```typescript
// app/example/page.tsx
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function ExamplePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* content */}
      </main>
      <Footer />
    </div>
  )
}
```

**3. New Client Component:**
```typescript
// components/example/example-component.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function ExampleComponent() {
  const [state, setState] = useState("")
  
  const handleClick = async () => {
    const response = await fetch('/api/example')
    const data = await response.json()
    // handle data
  }
  
  return <Button onClick={handleClick}>Click</Button>
}
```

### Code Patterns to Follow

**1. Database Queries:**
```typescript
// Always use typed collections
const db = await getDatabase()
const products = await db.collection<Product>('products').find({}).toArray()

// Use ObjectId for ID conversions
import { ObjectId } from "mongodb"
const product = await db.collection<Product>('products').findOne({
  _id: new ObjectId(id)
})
```

**2. Authentication Checks:**
```typescript
// User endpoint
const user = await getCurrentUser()
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

// Admin endpoint
const admin = await getCurrentAdmin()
if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

**3. Error Responses:**
- 400: Bad request (validation errors)
- 401: Unauthorized (not logged in)
- 403: Forbidden (logged in but insufficient permissions)
- 404: Not found
- 500: Internal server error

**4. Timestamps:**
```typescript
// Always add timestamps for new documents
const newDoc = {
  ...data,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Common Pitfalls to Avoid

1. **Environment Variables:** Use `MONGODB_URI` not `MONGODB_URL` (check `.env` vs code)
2. **TypeScript Errors:** `next.config.mjs` has `ignoreBuildErrors: true` - still write correct types
3. **Admin vs User:** Don't confuse user auth with admin auth - separate systems
4. **Middleware Limitations:** Middleware only redirects, doesn't check roles - always use `getCurrentUser()`/`getCurrentAdmin()` in API routes
5. **Client vs Server:** Don't use `getCurrentUser()` in client components - fetch from API instead
6. **ObjectId Conversion:** Always convert string IDs to ObjectId: `new ObjectId(id)`

### Testing & Debugging

**Local Development:**
```bash
npm install
npm run dev  # http://localhost:3000
```

**Creating Test Admin:**
```bash
npx ts-node scripts/seed-admin.ts
# Creates admin@printwibe.com / admin123456
```

**Checking Auth:**
- Browser DevTools → Application → Cookies
- Look for `auth-token` or `admin-token`
- Server logs show auth failures

**Common Debug Points:**
- Database connection: Check `MONGODB_URI` in `.env`
- Auth issues: Verify cookie is set and sent
- API errors: Check server console for `console.error()` output

### File Structure Reference

```
App/
├── app/                      # Next.js App Router
│   ├── (auth)/               # User auth pages (login, register)
│   ├── api/                  # API routes
│   │   ├── auth/             # User auth endpoints
│   │   ├── products/         # Product endpoints
│   │   ├── cart/             # Cart endpoints
│   │   ├── orders/           # Order endpoints
│   │   ├── user/             # User profile endpoints
│   │   ├── upload/           # File upload endpoint
│   │   ├── payments/         # Payment endpoints
│   │   ├── contact/          # Contact form endpoint
│   │   └── v1/admin/         # Admin endpoints
│   ├── products/             # Product pages
│   ├── cart/                 # Cart page
│   ├── checkout/             # Checkout page
│   ├── profile/              # User profile pages
│   ├── contact/              # Contact page
│   ├── v1/admin/             # Admin dashboard
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
│
├── components/               # React components
│   ├── ui/                   # shadcn/ui components (client)
│   ├── layout/               # Layout components
│   ├── home/                 # Homepage sections
│   ├── products/             # Product components
│   ├── cart/                 # Cart components
│   ├── checkout/             # Checkout components
│   ├── admin/                # Admin components
│   ├── auth/                 # Auth forms
│   ├── contact/              # Contact form
│   └── toast/                # Toast system
│
├── lib/                      # Utilities
│   ├── mongodb.ts            # Database connection
│   ├── models.ts             # Collection helpers
│   ├── auth.ts               # Auth utilities
│   ├── utils.ts              # General utilities (cn)
│   └── models/
│       └── types.ts          # TypeScript types
│
├── middleware.ts             # Route protection
├── .env                      # Environment variables
├── next.config.mjs           # Next.js config
├── package.json              # Dependencies
└── tsconfig.json             # TypeScript config
```

---

## Quick Reference

**Environment Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - User JWT secret
- `ADMIN_JWT_SECRET` - Admin JWT secret (optional, defaults to hardcoded)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` - Server-side Razorpay
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Client-side Razorpay
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage
- `NEXT_PUBLIC_APP_URL` - App URL

**Useful Commands:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx ts-node scripts/seed-admin.ts` - Create admin user

**Key Files to Reference:**
- `lib/auth.ts` - All auth patterns
- `lib/models.ts` - Database query patterns
- `lib/models/types.ts` - All TypeScript types
- `app/api/products/route.ts` - Standard GET endpoint with filters
- `app/api/cart/route.ts` - Full CRUD example
- `components/auth/login-form.tsx` - Client-side form + fetch
- `middleware.ts` - Route protection logic

---

## When in Doubt

1. **Check existing patterns** - Find similar functionality and replicate
2. **Use TypeScript types** - All types are in `lib/models/types.ts`
3. **Follow auth patterns** - Always use `getCurrentUser()`/`getCurrentAdmin()`
4. **Consistent responses** - Use `NextResponse.json()` with proper status codes
5. **Add error handling** - Wrap in try/catch with console.error
6. **Test locally** - Run `npm run dev` and verify in browser

**Questions to ask before making changes:**
- Is this a user or admin feature?
- Does this need authentication?
- What database collections are involved?
- Are there similar examples in the codebase?
- What HTTP methods and status codes should I use?

---

This codebase follows consistent patterns throughout. When adding new features, always look for existing similar implementations and follow the same structure. Prefer incremental changes over large refactors.
