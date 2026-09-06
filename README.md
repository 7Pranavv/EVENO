# Eveno

A full-stack event management and vendor marketplace platform for colleges and creators — organizers list events and collect registrations, participants discover and pay for events via Razorpay, and vendors offer services that organizers can hire.

This repo contains both halves of the app:

```
eveno/
  frontend/   Next.js + React + TypeScript app (see frontend/README.md)
  backend/    Express + MongoDB API (see backend/README.md)
  k8s/        Kubernetes manifests (see k8s/README.md)
  DEPLOY.md   Hosting on Render + Vercel + MongoDB Atlas
```

## Run it with Docker

The quickest way to get the whole stack — database included — running at once:

```bash
cp .env.example .env      # fill in Descope and Razorpay values
docker compose up --build
```

Frontend on http://localhost:3000, API on http://localhost:8080, MongoDB on
port 27017. Load sample data with `cd backend && npm run seed` once it's up.

One thing to know: `NEXT_PUBLIC_*` values are compiled into the browser bundle
when the frontend image is built, so changing `NEXT_PUBLIC_API_BASE` needs
`docker compose build frontend`, not just a restart.

For a cluster, see [`k8s/README.md`](k8s/README.md). To put it on the internet
(Render + Vercel + MongoDB Atlas), see [`DEPLOY.md`](DEPLOY.md).

## Quick start (without Docker)

Both apps run independently and talk to each other over HTTP — you need both running for the app to fully work.

```bash
# Terminal 1 — backend (http://localhost:8080)
cd backend
npm install
npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm install
npm run dev
```

Each app needs its own `.env` file — see the setup instructions in [`frontend/README.md`](frontend/README.md) and [`backend/README.md`](backend/README.md) for the exact variables each one needs (Descope project ID, MongoDB URI, Razorpay keys).

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, Descope (auth)
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Descope session verification, Razorpay
- **Deployment:** Docker (multi-stage, non-root), Docker Compose, Kubernetes
