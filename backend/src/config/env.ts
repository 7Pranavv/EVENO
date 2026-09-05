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

export const env = {
  mongoUri:           process.env.MONGO_URI!,
  descopeProjectId:   process.env.DESCOPE_PROJECT_ID!,
  razorpayKeyId:      process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret:  process.env.RAZORPAY_KEY_SECRET!,
  port:               Number(process.env.PORT) || 8080,
  corsOrigin:         process.env.CORS_ORIGIN || "http://localhost:3000",
};
