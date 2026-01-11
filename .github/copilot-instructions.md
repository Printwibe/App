## PrintWibe — AI Agent Instructions (Concise)

Purpose: Help coding agents be immediately productive in this Next.js + MongoDB e-commerce repository.

Key assumptions & conventions

- This repo uses Next.js (App Router) — server components by default; `"use client"` indicates a client component. See `components/ui/*` for examples.
- Database access uses `getDatabase()` from `lib/mongodb.ts` and the `printwibe` DB. Use `ObjectId` from `mongodb` for ID conversions.
- Authentication uses JWT in an HTTP-only cookie named `auth-token`. See `lib/auth.ts` and `app/api/auth/login/route.ts` for token generation and `middleware.ts` for route protection.
- Admin protection: middleware only redirects if the cookie is missing. Use `isAdmin()` server-side to enforce role-level checks (see `lib/auth.ts`). Admin API routes are under `/api/v1/admin`.
- File uploads use Vercel Blob (`@vercel/blob` + `put`) and are validated for type/size in `app/api/upload/route.ts` (accepted: png/jpg/jpeg/svg, max 5MB).
- Razorpay integration is in `app/api/payments/razorpay/route.ts`. Server-side uses `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Client integration should use `NEXT_PUBLIC_RAZORPAY_KEY_ID`.

Environment notes / gotchas

- `lib/mongodb.ts` expects `process.env.MONGODB_URI` but `.env` uses `MONGODB_URL`. Ensure `MONGODB_URI` is defined or update `lib/mongodb.ts` before testing locally.
- `next.config.mjs` sets `typescript.ignoreBuildErrors: true`. Type errors won't block builds — be mindful when adding types.
- Cookies are set with `sameSite: 'lax'` and `httpOnly: true`. Client-side `fetch('/api/...')` uses same-origin calls to access session-protected endpoints.

Development & common commands

- Install & run: `npm install`, `npm run dev` (use `dev` for fast iteration). Build: `npm run build`; start in production: `npm start`.
- Lint: `npm run lint`.

Project structure & where to change things

- UI primitives: `components/ui/*` (`use client`) — reuse classes via `cn()` from `lib/utils.ts` and cva patterns (e.g., `components/ui/button.tsx`).
- Pages: `app/` follows App Router; each route contains `page.tsx` and optionally `layout.tsx`.
- API: `app/api/*` — follow the existing style: `NextRequest` handler functions, try/catch and `NextResponse.json(...)` with correct status codes.
- Models & types: `lib/models/types.ts` — use these when manipulating DB records.

Coding guidelines for agents (project-specific)

- Server-side auth: call `const user = await getCurrentUser()` to obtain the user and check role via `isAdmin()` for admin-only behavior. Return `401` JSON if unauthorized.
- For new endpoints: follow the pattern in `app/api/*/route.ts` — use `getDatabase()`, typed collections (e.g., `db.collection<Product>('products')`), and consistent Response structure (`{ message, ... }` or `{ error }`).
- When changing DB models, update `lib/models/types.ts` and relevant API routes. Add `createdAt`/`updatedAt` timestamps in insert operations.
- File uploads: keep server-side validation (type/size) and store metadata in `customDesigns` collection; upload actual file via `@vercel/blob` `put(...)`.
- Admin checks: always double-check server-side `isAdmin()` before performing destructive operations. Middleware only redirects to login and is not a replacement for `isAdmin()` checks.
- Pagination & search pattern: Use `searchParams` in GET routes (see products route). Keep `limit` & `page` defaults consistent.

Quick examples agents can follow

- Add protected admin API: replicate `app/api/v1/admin/products/route.ts` pattern; check `isAdmin()` then do DB operation.
- Add server-side user endpoint: call `getCurrentUser()` and retrieve user-specific records (e.g., `orders`, `carts`).
- Implement client-side fetch with redirects: client components generally use `fetch('/api/...')` and then read `res.json()`; follow `components/auth/login-form.tsx` example.

Testing & debugging tips

- Use local `MONGODB_URI` to test DB-backed endpoints and create test users. Create an admin user manually by setting `role: 'admin'` in your local DB.
- Check server logs for `console.error(...)` outputs. The code uses `console.error` in catch blocks.
- Use the browser devtools to verify the `auth-token` HTTP-only cookie is set and included with requests.

Where to look for more context

- Core: `README.md` (project overview) and `lib/*` (database/auth utilities)
- API examples: `app/api/auth`, `app/api/products`, `app/api/upload`, `app/api/payments`.
- UI patterns: `components/ui/*` and `components/*` (product and admin UI)

If you are adding or editing files, prefer minimal, incremental changes; mimic existing patterns closely — avoid introducing global changes (e.g., swapping cookie names) without updating related modules and tests.

Questions to ask if uncertain

- Should the agent keep `MONGODB_URI` env var name or align to `MONGODB_URL` from `.env`?
- Should the agent add tests or lint fixes? (No test harness exists.)

Thanks — ask for clarifications if anything is ambiguous in the code or conventions.
