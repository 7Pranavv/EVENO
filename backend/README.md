# Emple Events — Backend

Express + MongoDB API for [Emple Events](../emple-events-main), a college/creator event management platform (events, registrations, Razorpay payments, vendor hiring, admin escrow).

This repo is the **backend**. It's meant to run alongside the frontend Next.js app (`emple-events-main`), which expects it on `http://localhost:8080` by default.

## Tech stack

- **Runtime:** Node.js + TypeScript, run via `ts-node`/`nodemon` in dev
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** [Descope](https://www.descope.com/) session token verification (`@descope/node-sdk`)
- **Payments:** Razorpay (order creation + signature verification)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/emple-events?retryWrites=true&w=majority
DESCOPE_PROJECT_ID=your_descope_project_id
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

- `MONGO_URI` — a MongoDB Atlas (or local) connection string. URL-encode any special characters in the password (e.g. `@` → `%40`).
- `DESCOPE_PROJECT_ID` — **must match** the `NEXT_PUBLIC_DESCOPE_PROJECT_ID` used by the frontend, since this backend verifies the session tokens Descope issues to that project.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — from your [Razorpay dashboard](https://dashboard.razorpay.com/) (test-mode keys are fine for development).

### 3. Run the dev server

```bash
npm run dev
```

The server starts on `http://localhost:8080` (or whatever `PORT` is set to) and logs a MongoDB connection confirmation on startup.

### 4. Run the frontend alongside it

This API is not useful standalone — pair it with the [frontend repo](../emple-events-main) (`npm run dev` there, on `http://localhost:3000`). CORS is currently locked to that origin in `src/server.ts`.

## API overview

All routes are mounted under `/api`.

| Resource | Base path | Notes |
|---|---|---|
| Events | `/api/events` | Public reads; create/update/delete/disburse require auth + ownership |
| Registrations | `/api/registrations` | Create requires auth; `/mine` scoped to the logged-in participant |
| Vendors | `/api/vendors` | Service CRUD requires auth + ownership; stats/requests/revenue/withdraw per vendor |
| Payments | `/api/payments` | `create-order` and `verify` — Razorpay integration, both require auth |
| Users | `/api/users` | `sync` upserts the logged-in user's profile; `/me` get/update own profile; admin list + ban/unban |
| Admin | `/api/admin` | `/escrow` — aggregated per-event collected/disbursed summary |

### Auth model

- Reads (`GET`) are generally public.
- Writes require a valid Descope session token in `Authorization: Bearer <token>` (checked by `src/middleware/auth.ts`).
- Ownership is enforced server-side where it matters — e.g. you can only edit/delete your own events or vendor services, and only the assigned vendor can accept/reject a hire request for themselves. The authenticated user's ID always wins over anything the client sends in the request body (so a client can't spoof `vendorId`/`organizerId`).
- There's no separate "admin" role/gate yet — any authenticated user can currently reach the admin endpoints. If you need real admin-only enforcement, that's the next thing to add (e.g. a `role` check against the `User` model in `requireAuth`).

## Project structure

```
src/
  server.ts              Express app setup, route mounting
  config/db.ts           Mongoose connection
  middleware/auth.ts      Descope session verification
  models/                 Mongoose schemas (Event, Registration, User, Vendor, VendorService)
  controllers/            Route handlers, one file per resource
  routes/                 Express routers, one file per resource
```

## Building for production

```bash
npm run build   # compiles TypeScript to dist/
npm start        # runs dist/server.js
```
