import dotenv from "dotenv";

dotenv.config();

// Fail at boot with a clear message instead of at first request with
// "key_id or key_secret is mandatory" from deep inside a vendor SDK.
const REQUIRED = [
  "MONGO_URI",
  "DESCOPE_PROJECT_ID",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

// CORS_ORIGIN accepts a comma-separated list, because the frontend legitimately
// lives at more than one address once it is hosted — the production domain plus
// whichever preview URLs you want working.
//
// Deliberately no wildcard support. `*.vercel.app` would look convenient and
// would let anyone's Vercel deployment make credentialed calls to this API.
export const parseOrigins = (raw: string | undefined): string[] =>
  (raw ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))   // a trailing slash never matches
    .filter(Boolean);

export const env = {
  mongoUri:           process.env.MONGO_URI!,
  descopeProjectId:   process.env.DESCOPE_PROJECT_ID!,
  razorpayKeyId:      process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret:  process.env.RAZORPAY_KEY_SECRET!,
  // Render and most PaaS hosts assign the port and expect you to use theirs.
  port:               Number(process.env.PORT) || 8080,
  corsOrigins:        parseOrigins(process.env.CORS_ORIGIN),
};
