# Eveno

A full-stack event management and vendor marketplace platform for colleges and creators — organizers list events and collect registrations, participants discover and pay for events via Razorpay, and vendors offer services that organizers can hire.

This repo contains both halves of the app:

```
eveno/
  frontend/   Next.js + React + TypeScript app (see frontend/README.md)
  backend/    Express + MongoDB API (see backend/README.md)
```

## Quick start

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
