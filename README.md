# PrintWibe - Custom Print E-Commerce Platform

A full-stack e-commerce platform for custom printed merchandise built with Next.js 15 and MongoDB.

## Features

- **Product Catalog** - T-shirts, shirts, mugs, bottles with variants (size, color)
- **Custom Design Upload** - Users can upload their own designs for products
- **Shopping Cart** - Full cart management with quantity controls
- **Checkout** - Razorpay integration and Cash on Delivery (COD)
- **User Profiles** - Account management, order history, addresses
- **Admin Dashboard** - Product management, order tracking, inventory control, customer management
- **Separate Admin Authentication** - Secure admin login with separate JWT tokens
- **Toast Notifications** - User feedback for all actions throughout the app
- **Contact Page** - Contact form with FAQ section

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15 (App Router) |
| Database | MongoDB with native driver |
| Authentication | JWT (JSON Web Tokens) - Separate for Users & Admin |
| Payments | Razorpay |
| File Storage | Vercel Blob |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |

---

## Project Structure

\`\`\`
printwibe/
├── app/
│   ├── (auth)/                    # User authentication pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── products/                  # Product pages
│   │   ├── page.tsx               # Product listing with search
│   │   └── [slug]/page.tsx        # Product detail
│   │
│   ├── cart/page.tsx              # Shopping cart
│   ├── checkout/page.tsx          # Checkout flow
│   ├── order-success/page.tsx     # Order confirmation
│   ├── contact/page.tsx           # Contact page with form
│   │
│   ├── profile/                   # User profile section
│   │   ├── layout.tsx             # Profile layout with header
│   │   ├── page.tsx               # Account info
│   │   ├── orders/page.tsx        # Order history
│   │   ├── orders/[id]/page.tsx   # Order detail
│   │   ├── addresses/page.tsx     # Manage addresses
│   │   └── settings/page.tsx      # Change password
│   │
│   ├── v1/admin/                  # Admin dashboard
│   │   ├── login/page.tsx         # Admin login (separate auth)
│   │   ├── layout.tsx             # Admin layout with sidebar
│   │   ├── page.tsx               # Dashboard overview
│   │   ├── products/page.tsx      # Product list
│   │   ├── products/new/page.tsx  # Add product
│   │   ├── orders/page.tsx        # Order management
│   │   ├── orders/[orderId]/page.tsx # Order detail with status update
│   │   ├── customers/page.tsx     # Customer management
│   │   └── settings/page.tsx      # Store settings
│   │
│   └── api/                       # API routes
│       ├── auth/                  # User auth endpoints
│       ├── v1/admin/auth/         # Admin auth endpoints (separate)
│       ├── products/
│       ├── cart/
│       ├── orders/
│       ├── upload/
│       ├── payments/
│       ├── user/
│       ├── contact/
│       └── v1/admin/
│
├── components/
│   ├── layout/                    # Header, Footer, ProfileHeader
│   ├── home/                      # Homepage sections
│   ├── products/                  # Product components
│   ├── cart/                      # Cart components
│   ├── checkout/                  # Checkout components
│   ├── admin/                     # Admin components
│   ├── contact/                   # Contact form
│   ├── toast/                     # Toast notification system
│   └── ui/                        # shadcn/ui components
│
├── lib/
│   ├── mongodb.ts                 # Database connection
│   ├── models.ts                  # MongoDB model operations
│   ├── auth.ts                    # Authentication utilities (user & admin)
│   ├── use-toast-hook.ts          # Toast hook
│   └── models/
│       └── types.ts               # TypeScript interfaces
│
├── scripts/
│   └── seed-admin.ts              # Admin seeding script
│
└── middleware.ts                  # Route protection (user & admin)
\`\`\`

---

## Architecture & Design

### System Overview

PrintWibe is a full-stack e-commerce platform with the following key characteristics:

**Architecture Pattern:**
- **Frontend:** Next.js 15 App Router (Server-first architecture)
- **Backend:** Next.js API Routes (serverless functions)
- **Database:** MongoDB (document-based, native driver)
- **Authentication:** JWT-based with HTTP-only cookies
- **File Storage:** Vercel Blob (cloud storage)
- **Payment Gateway:** Razorpay integration

**Key Design Decisions:**

1. **Dual Authentication System**: Separate JWT tokens and collections for users (`users` collection, `auth-token` cookie) and admins (`admins` collection, `admin-token` cookie). This ensures complete isolation between customer and admin access.

2. **Server Components First**: Leverages Next.js 15 Server Components for direct database access and better performance. Client components (`"use client"`) only used for interactivity.

3. **API Route Pattern**: RESTful API design with consistent response formats:
   - User endpoints: `/api/*`
   - Admin endpoints: `/api/v1/admin/*`

4. **Type Safety**: Full TypeScript coverage with centralized type definitions in `lib/models/types.ts`.

5. **Component Organization**: shadcn/ui for reusable UI primitives, custom components for business logic.

### Authentication Flow

**User Authentication:**
1. User registers via `/api/auth/register` → password hashed with bcryptjs
2. User logs in via `/api/auth/login` → JWT generated with `JWT_SECRET`
3. JWT stored in HTTP-only cookie named `auth-token`
4. Protected routes check cookie via `middleware.ts`
5. API routes verify token using `getCurrentUser()` from `lib/auth.ts`

**Admin Authentication (Separate):**
1. Admin logs in via `/api/v1/admin/auth/login`
2. Credentials checked against `admins` collection (not `users`)
3. JWT generated with `ADMIN_JWT_SECRET`
4. JWT stored in HTTP-only cookie named `admin-token`
5. Admin routes check cookie and verify using `getCurrentAdmin()`

**Route Protection (middleware.ts):**
- `/profile/*` → requires `auth-token`
- `/checkout/*` → requires `auth-token`
- `/v1/admin/*` → requires `admin-token` (except login page)
- `/login`, `/register` → redirect if already logged in

### Payment Integration

**Razorpay Flow:**
1. User selects payment method at checkout
2. If Razorpay: POST to `/api/payments/razorpay` creates order
3. Client loads Razorpay SDK with order ID
4. User completes payment on Razorpay modal
5. Success: Create order with `paymentStatus: "paid"` and `razorpayPaymentId`
6. Order confirmation page shown

**Cash on Delivery (COD):**
1. User selects COD at checkout
2. Order created immediately with `paymentStatus: "pending"`
3. Order confirmation page shown
4. Admin updates payment status upon delivery

### File Upload Flow

1. User selects product with custom design option
2. File selected via `<input type="file">`
3. Client-side validation: type (PNG/JPG/JPEG/SVG), size (max 5MB)
4. POST to `/api/upload` with FormData
5. Server validates and uploads to Vercel Blob
6. Metadata stored in `customDesigns` collection
7. Design ID associated with cart item
8. Design URL included in order details

---

## API Routes

### User Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/auth/register\` | Register new user |
| POST | \`/api/auth/login\` | User login |
| POST | \`/api/auth/logout\` | User logout |
| GET | \`/api/auth/me\` | Get current user |

### Admin Authentication (Separate)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/v1/admin/auth/login\` | Admin login |
| POST | \`/api/v1/admin/auth/logout\` | Admin logout |
| GET | \`/api/v1/admin/auth/me\` | Get current admin |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/products\` | List all products (with filters) |
| GET | \`/api/products/[slug]\` | Get product by slug |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/cart\` | Get user's cart |
| POST | \`/api/cart\` | Add item to cart |
| PUT | \`/api/cart\` | Update cart item quantity |
| DELETE | \`/api/cart\` | Remove item from cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/user/orders\` | Get user's orders |
| GET | \`/api/user/orders/[id]\` | Get order detail |
| POST | \`/api/orders\` | Create new order |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/payments/razorpay\` | Create Razorpay order |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/user/profile\` | Get profile |
| PUT | \`/api/user/profile\` | Update profile |
| PUT | \`/api/user/password\` | Change password |
| GET | \`/api/user/addresses\` | Get addresses |
| POST | \`/api/user/addresses\` | Add address |
| PUT | \`/api/user/addresses\` | Update address |
| DELETE | \`/api/user/addresses\` | Delete address |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/upload\` | Upload custom design |

### Contact
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | \`/api/contact\` | Submit contact form |

### Admin Routes (v1/admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | \`/api/v1/admin/products\` | List all products |
| POST | \`/api/v1/admin/products\` | Create product |
| GET | \`/api/v1/admin/products/[id]\` | Get product |
| PUT | \`/api/v1/admin/products/[id]\` | Update product |
| DELETE | \`/api/v1/admin/products/[id]\` | Delete product |
| GET | \`/api/v1/admin/orders\` | List all orders |
| PUT | \`/api/v1/admin/orders/[id]\` | Update order status |

---

## Database Collections

### users
\`\`\`javascript
{
  _id, name, email, password (hashed), phone, dob, role,
  addresses: [{ type, house, street, city, state, postalCode, country, isDefault }],
  createdAt, updatedAt
}
\`\`\`

### admins (Separate collection for admin users)
\`\`\`javascript
{
  _id, name, email, password (hashed), role: "admin", status,
  createdAt, updatedAt
}
\`\`\`

### products
\`\`\`javascript
{
  _id, name, slug, description, category, basePrice, customizationPrice,
  images: [], variants: [{ size, color, stock, sku }],
  allowCustomization, isActive, createdAt, updatedAt
}
\`\`\`

### carts
\`\`\`javascript
{
  _id, userId,
  items: [{ productId, variant, quantity, isCustomized, customDesignId, unitPrice, customizationFee }],
  updatedAt
}
\`\`\`

### orders
\`\`\`javascript
{
  _id, orderId, userId,
  items: [{ productId, name, variant, quantity, isCustomized, customDesign, unitPrice, customizationFee, itemTotal }],
  shippingAddress, paymentMethod, paymentStatus, razorpayOrderId, razorpayPaymentId,
  orderStatus, subtotal, shipping, total, createdAt, updatedAt
}
\`\`\`

### customDesigns
\`\`\`javascript
{
  _id, userId, productId, fileName, fileUrl, fileType, fileSize,
  dimensions: { width, height }, printArea: { x, y, width, height },
  status, createdAt, updatedAt
}
\`\`\`

### contacts
\`\`\`javascript
{
  _id, name, email, phone, subject, message, status,
  createdAt
}
\`\`\`

---

## Getting Started

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd printwibe
npm install
\`\`\`

### 2. Environment Setup
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your values
\`\`\`

### 3. MongoDB Setup
Create a MongoDB database and add these collections:
- \`users\`
- \`admins\`
- \`products\`
- \`carts\`
- \`orders\`
- \`customDesigns\`
- \`contacts\`

### 4. Seed Admin User

**Option 1: Using the seed script**
\`\`\`bash
# Make sure your MONGODB_URI is set in .env.local
npx ts-node scripts/seed-admin.ts
\`\`\`

This will create an admin user with:
- **Email:** admin@printwibe.com
- **Password:** admin123456

> ⚠️ **IMPORTANT:** Change the password after first login!

**Option 2: Manual MongoDB insertion**
\`\`\`javascript
// Connect to your MongoDB and run:
db.admins.insertOne({
  email: "admin@printwibe.com",
  password: "$2a$10$...", // bcrypt hash of your password
  name: "PrintWibe Admin",
  role: "admin",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date()
})
\`\`\`

To generate a bcrypt hash, you can use:
\`\`\`javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

### 6. Access the Application
- **User Site:** http://localhost:3000
- **Admin Login:** http://localhost:3000/v1/admin/login

---

## Page Routes

### Public Routes
| Route | Description |
|-------|-------------|
| \`/\` | Homepage |
| \`/products\` | Product listing with search |
| \`/products/[slug]\` | Product detail |
| \`/login\` | User login page |
| \`/register\` | User registration page |
| \`/contact\` | Contact page |

### Protected Routes (Requires User Login)
| Route | Description |
|-------|-------------|
| \`/cart\` | Shopping cart |
| \`/checkout\` | Checkout page |
| \`/order-success\` | Order confirmation |
| \`/profile\` | User account info |
| \`/profile/orders\` | Order history |
| \`/profile/orders/[id]\` | Order detail |
| \`/profile/addresses\` | Manage addresses |
| \`/profile/settings\` | Change password |

### Admin Routes (Requires Admin Login)
| Route | Description |
|-------|-------------|
| \`/v1/admin/login\` | Admin login page |
| \`/v1/admin\` | Dashboard overview |
| \`/v1/admin/products\` | Product management |
| \`/v1/admin/products/new\` | Add new product |
| \`/v1/admin/orders\` | Order management |
| \`/v1/admin/orders/[orderId]\` | Order detail with status update |
| \`/v1/admin/customers\` | Customer management |
| \`/v1/admin/settings\` | Store settings |

---

## Security Features

- **Separate JWT tokens** for users and admins
- **Middleware protection** for all protected routes
- **Password hashing** with bcryptjs
- **Admin verification** checks email and role from \`admins\` collection
- **HTTP-only cookies** for token storage

---

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Add Vercel Blob storage from Vercel dashboard
5. Deploy

### Environment Variables in Vercel
Add all variables from \`.env.example\` to your Vercel project settings:
- \`MONGODB_URI\`
- \`JWT_SECRET\`
- \`ADMIN_JWT_SECRET\`
- \`RAZORPAY_KEY_ID\`
- \`RAZORPAY_KEY_SECRET\`
- \`NEXT_PUBLIC_RAZORPAY_KEY_ID\`
- \`BLOB_READ_WRITE_TOKEN\`
- \`NEXT_PUBLIC_APP_URL\`
- \`NEXT_PUBLIC_APP_NAME\`
- \`ADMIN_EMAIL\`
- \`RESEND_API_KEY\` (optional)

---

## Developer Documentation

For detailed development guidelines, code patterns, and best practices, see:

📚 **[Developer Guide](.github/DEVELOPMENT.md)** - Comprehensive development documentation
- Architecture deep dive
- Database operations
- Authentication patterns
- API development
- Component patterns
- File uploads & payments
- Troubleshooting

📋 **[Quick Reference](.github/CHEATSHEET.md)** - Code snippets and common patterns

🤖 **[AI Agent Instructions](.github/copilot-instructions.md)** - Guidelines for AI-assisted development

---

## License

MIT License - feel free to use for personal or commercial projects.
