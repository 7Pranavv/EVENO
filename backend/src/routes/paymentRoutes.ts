import { Router } from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController";
import { requireAuth } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";

const router = Router();

// 20 payment calls per user per 15 minutes is far above real usage and well
// below what's useful for hammering the gateway.
const paymentLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post("/create-order", requireAuth, paymentLimit, createOrder);
router.post("/verify",       requireAuth, paymentLimit, verifyPayment);

export default router;
