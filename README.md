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

| Category       | Technology                                         |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 15 (App Router)                            |
| Database       | MongoDB with native driver                         |
| Authentication | JWT (JSON Web Tokens) - Separate for Users & Admin |
| Payments       | Razorpay                                           |
| File Storage   | Vercel Blob                                        |
| Styling        | Tailwind CSS v4                                    |
| UI Components  | shadcn/ui                                          |

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
