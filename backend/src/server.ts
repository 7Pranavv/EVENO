// Must be first: validates and loads env before any module builds an SDK
// client from process.env at import time.
import { env } from "./config/env";

import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import eventRoutes from "./routes/eventRoutes";
import registrationRoutes from "./routes/registrationRoutes";
import vendorRoutes from "./routes/vendorRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import { startStaleSeatSweeper } from "./jobs/releaseStaleSeats";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ message: "Eveno API is running" });
});

// Liveness: is this process still able to answer? Deliberately does not touch
// the database — a Mongo outage should not make Kubernetes kill every pod.
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

// Readiness: should this pod receive traffic? Here the database does matter,
// because every route below needs it.
app.get("/readyz", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    status: connected ? "ready" : "no database connection",
  });
});

app.use("/api/events", eventRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Express 5 forwards rejected promises from async handlers here, so
// controllers don't need their own try/catch.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);

  if (err?.name === "ValidationError") {
    res.status(400).json({ message: err.message });
    return;
  }
  if (err?.name === "CastError") {
    res.status(400).json({ message: "Malformed id" });
    return;
  }

  // Never leak stack traces or driver internals to the client.
  res.status(500).json({ message: "Server error" });
});

if (require.main === module) {
  connectDB().then(() => {
    startStaleSeatSweeper();

    const server = app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });

    // Kubernetes sends SIGTERM and then waits before SIGKILL. Closing the
    // listener lets in-flight requests finish instead of being cut off
    // mid-payment on every rolling update.
    const shutdown = (signal: string) => {
      console.log(`${signal} received, shutting down`);
      server.close(async () => {
        await mongoose.disconnect();
        process.exit(0);
      });

      // Don't hang forever if a connection refuses to drain.
      setTimeout(() => {
        console.error("Shutdown timed out, exiting");
        process.exit(1);
      }, 10_000).unref();
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  });
}

export default app;
