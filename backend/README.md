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

- Public reads: the event listing and the vendor service marketplace. Everything else needs a valid Descope session token in `Authorization: Bearer <token>`.
- `requireAuth` validates the token *and* loads the local `User` row, so `req.user.role` is always the server's own value — never something the client sent. A user whose `status` is `banned` is rejected immediately rather than at token expiry.
- `requireRole(...)` gates role-specific routes. Admin endpoints (`/api/admin/*`, `GET /api/users`, `PUT /api/users/:id/status`, `PUT /api/events/:id/disburse`) require `role === "admin"`.
- Ownership is enforced per-resource: you can only edit or delete your own events and services, only the assigned vendor can action a hire request, and payment orders and verification are bound to the caller's own registration.
- Money-shaped values are never taken from the request body. The payment amount is read from the stored registration, and `organizerId` / `vendorId` come from the session.

### Creating an admin

There is deliberately no signup or API path to the admin role — `/api/users/sync` rejects it. Grant it against the database directly, after the person has signed up once:

```bash
npx ts-node src/scripts/makeAdmin.ts someone@example.com
```

### Demo data

The app looks empty on a fresh database. `npm run seed` fills it with a
consistent sample platform — 10 events across a spread of categories and price
points (including two free ones), ~430 distinct attendees, ~1,270
registrations, 4 vendors with 9 services, and 9 hire requests in mixed states.
One event is already disbursed and one account is suspended, so the admin
dashboard has both states to render.

```bash
npm run seed                          # replace demo data with a fresh set
npm run seed -- --as you@example.com  # ...and give the matching demo role to your own account
npm run seed:reset                    # remove demo data only
```

`--as` is the useful one for a demo: the dashboards filter to the signed-in
user, so without it the seeded events belong to a fictional organizer and your
own dashboard still looks empty. Sign up in the app first, then pass your
email — the demo identity matching your role (organizer, vendor or participant)
is handed over to your real account.

Every seeded record carries `demo: true`. The reset deletes exactly those, so
it can never remove something a real user created. All the people, colleges and
vendors are fictional and every email is on `example.com`.

The data is generated rather than hand-written, so it stays internally
consistent: `availableSeats` is derived from the registrations that actually
exist, nobody is registered for the same event twice, rows marked paid carry
payment references, and unpaid rows are stamped recently enough that the
stale-seat sweeper doesn't quietly reclaim them minutes after seeding.
`src/scripts/buildSeed.ts` builds the documents without touching the database,
which is what lets those properties be unit-tested.

### Background jobs

`src/jobs/releaseStaleSeats.ts` runs every 5 minutes and returns seats held by registrations that have sat unpaid for more than 15 minutes — the case where someone opens the payment sheet and never comes back.

## Project structure

```
src/
  server.ts               Express app setup, route mounting, error handler
  config/env.ts           Loads and validates env vars — imported first
  config/db.ts            Mongoose connection
  middleware/auth.ts      Descope session verification, role guards
  middleware/rateLimit.ts In-memory per-user rate limiter
  models/                 Mongoose schemas (Event, Registration, User, Vendor, VendorService)
  controllers/            Route handlers, one file per resource
  routes/                 Express routers, one file per resource
  jobs/                   Periodic background tasks
  scripts/                One-off operational scripts (makeAdmin, seed)
```

## Checks

```bash
npm run typecheck   # tsc --noEmit (strict mode)
npm test            # node:test — route guards and field whitelisting
```

## Building for production

```bash
npm run build   # compiles TypeScript to dist/
npm start        # runs dist/server.js
```
