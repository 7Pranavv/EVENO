# Deploying Eveno: Render + Vercel

The API goes to Render, the web app to Vercel, and the database to MongoDB
Atlas. All three have a free tier that fits this app.

Everything below happens in a browser under your own accounts. Do these steps
yourself — they involve credentials and payment keys.

## Order matters

The two halves each need the other's URL, so there's a loop to break:

1. Database first (nothing depends on it knowing a URL).
2. API next, with a placeholder `CORS_ORIGIN`.
3. Web app, pointed at the API's real URL.
4. Back to the API to set the real `CORS_ORIGIN`.

Skipping step 4 gives you a site that loads and where every request fails CORS.

---

## 1. MongoDB Atlas

Render has no managed MongoDB, so the database lives separately.

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user with a strong generated password.
3. **Network Access** → allow `0.0.0.0/0`. Render's free tier has no static
   outbound IP, so there is nothing narrower to allowlist. The database is then
   protected only by its credentials — use a long generated password and never
   commit it.
4. Copy the connection string and append the database name:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/eveno?retryWrites=true&w=majority
   ```

M0 gives 512MB, comfortably more than the demo seed (~1,700 documents).

## 2. API on Render

**New → Blueprint**, connect this repo. Render reads [`render.yaml`](render.yaml)
and creates the service with the right root directory, build command and health
check. It will prompt for the values marked `sync: false`:

| Variable | Value |
|---|---|
| `MONGO_URI` | the Atlas string from step 1 |
| `DESCOPE_PROJECT_ID` | from the Descope console |
| `RAZORPAY_KEY_ID` | Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | Razorpay dashboard — server-side only, never expose it |
| `CORS_ORIGIN` | `http://localhost:3000` for now; corrected in step 4 |

Prefer the dashboard over any other route for these — they are secrets, and
`render.yaml` deliberately stores none of them.

Deploy, then confirm:

```bash
curl https://<your-service>.onrender.com/healthz    # {"status":"ok"}
curl https://<your-service>.onrender.com/readyz     # {"status":"ready"} — proves Atlas is reachable
```

If `/readyz` returns 503, the API is up but cannot reach Atlas: check the
password encoding in the URI and that Network Access is open.

> **Free tier spins down after ~15 minutes idle.** The next request takes
> roughly 50 seconds while it wakes. The stale-seat sweeper also stops while
> the service is asleep, so abandoned checkouts hold their seats until it wakes.
> Neither matters for a demo; both are reasons to use a paid instance for real
> traffic.

## 3. Web app on Vercel

**Add New → Project**, import the same repo, then:

- **Root Directory:** `frontend` — this is the setting people miss, and without
  it the build fails to find a Next.js app.
- Framework preset: Next.js (auto-detected).

Environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `https://<your-service>.onrender.com` — no trailing slash |
| `NEXT_PUBLIC_DESCOPE_PROJECT_ID` | same project id as the API |

Both are `NEXT_PUBLIC_*`, so they are **compiled into the browser bundle at
build time**. Changing either one later requires a redeploy, not a restart.

## 4. Close the loop

Back in Render → Environment, set `CORS_ORIGIN` to your Vercel URL:

```
CORS_ORIGIN=https://<your-project>.vercel.app,http://localhost:3000
```

Comma-separated, no trailing slashes. Keeping `localhost:3000` means local
development still works against the deployed API.

**Preview deployments.** Vercel gives every branch a unique URL, and none of
them are in that list, so API calls from a preview will fail CORS. Add specific
preview URLs when you need them. There is intentionally no `*.vercel.app`
wildcard: anyone can deploy to `vercel.app`, so a suffix match would let any
stranger's site make credentialed calls to your API.

## 5. Descope

In the Descope console, add your Vercel domain to the project's approved
domains and OAuth redirect URLs, including `https://<your-project>.vercel.app/auth/callback`.
Until you do, login redirects back to an error.

## 6. Demo data (optional)

The seed script talks to the database directly, so run it from your machine
against Atlas rather than from Render:

```bash
cd backend
MONGO_URI='<atlas-uri>' DESCOPE_PROJECT_ID=x RAZORPAY_KEY_ID=x RAZORPAY_KEY_SECRET=x \
  npm run seed -- --as you@example.com
```

Sign up in the deployed app first, so `--as` has an account to hand the demo
organizer's events to. Remove it all later with `npm run seed:reset`.

## 7. Make yourself admin

There is no UI path to the admin role by design:

```bash
cd backend
MONGO_URI='<atlas-uri>' DESCOPE_PROJECT_ID=x RAZORPAY_KEY_ID=x RAZORPAY_KEY_SECRET=x \
  npx ts-node src/scripts/makeAdmin.ts you@example.com
```

---

## Before taking real payments

- **Razorpay live keys.** The test keys move no money. Swap them in Render only
  once the flow is verified end to end.
- **The rate limit is per-instance.** `src/middleware/rateLimit.ts` counts in
  process memory. One Render instance means it works as written; scale to two
  and the effective limit doubles. Move it to Redis before that matters.
- **Atlas is open to the internet** by IP. Rotate the password if it is ever
  pasted anywhere shared, and prefer a paid Render instance with a static IP if
  you want to narrow Network Access.
- **Nothing here is backed up.** Atlas M0 has no automated backups.
