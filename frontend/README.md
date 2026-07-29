# Emple Events

A complete event management platform for colleges and creators — list events, collect registrations, take payments through Razorpay, and connect organizers with vendors (photographers, caterers, DJs, etc.).

This repo is the **frontend** (Next.js). It talks to a separate backend API — see [Backend setup](#backend-setup) below.

## Tech stack

- **Framework:** Next.js 16 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS
- **Auth:** [Descope](https://www.descope.com/) (email/password + OAuth)
- **Payments:** Razorpay Checkout (client-side widget)

## Roles

The app has four dashboards, each gated by a role picked at signup/login (`/select-role`):

| Role | Dashboard | Can do |
|---|---|---|
| **Organizer** | `/organizer/dashboard`, `/organizer/vendors` | Create/edit/delete events, view registrations, hire vendors |
| **Participant** | `/participant/dashboard` | Browse events, register & pay via Razorpay, edit profile |
| **Vendor** | `/vendor/dashboard`, `/vendor/listings` | List services, accept/reject hire requests, withdraw earnings |
| **Admin** | `/admin/dashboard` | View all users, ban/unban, view escrow, disburse funds to organizers |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the project root:

```bash
NEXT_PUBLIC_DESCOPE_PROJECT_ID=your_descope_project_id
```

Get this from your [Descope project settings](https://app.descope.com/). The same project ID must also be set on the backend (as `DESCOPE_PROJECT_ID`) so it can verify session tokens.

### 3. Point the frontend at your backend

The backend base URL is hardcoded in [`lib/api.ts`](lib/api.ts) as `http://localhost:8080`. Change it there if your backend runs elsewhere.

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). The backend (see below) must also be running for anything beyond the static homepage to work — every dashboard, login flow, and API call depends on it.

## Backend setup

This frontend expects a companion Express + MongoDB backend running on `http://localhost:8080` (or wherever you point [`lib/api.ts`](lib/api.ts)). That backend lives in a sibling repo (`emple-events-backend`).

Quick start for the backend:

```bash
cd ../emple-events-backend
npm install
npm run dev
```

It needs its own `.env` with `MONGO_URI`, `DESCOPE_PROJECT_ID` (same project as the frontend), and `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`. See that repo's README for details.

**Without the backend running, the app will load the static homepage but every authenticated feature — login, dashboards, event creation, payments — will fail.**

## Project structure

```
app/
  page.tsx                    Landing page
  login/, signup/              Auth pages (Descope)
  select-role/                 Post-login role picker
  auth/callback/                OAuth redirect handler
  organizer/dashboard/          Organizer: events, registrations
  organizer/vendors/            Organizer: browse & hire vendors
  participant/dashboard/        Participant: browse events, register & pay
  vendor/dashboard/             Vendor: hire requests, earnings, withdraw
  vendor/listings/              Vendor: manage service listings
  admin/dashboard/              Admin: users, escrow, disbursement
  terms/, privacy/, contact/    Static pages

components/                    Shared UI (Sidebar, Header, homepage sections)
lib/
  api.ts                       API_BASE constant + getId() helper
  auth.ts                      Session token/user helpers (Descope-aware)
```

## Authentication notes

- Session tokens are managed by Descope and refresh automatically in the background (`components/SessionKeepAlive.tsx`) — `lib/auth.ts`'s `getToken()` always reads the live, current token rather than a stale cached copy.
- Every mutating API call (create/update/delete, hire, accept/reject, withdraw, ban/unban) requires a valid session and is authorized server-side against the resource owner — not just "is logged in."
- Logging out (sidebar → power icon) clears both the Descope session and local app state.

## Building for production

```bash
npm run build
npm start
```
