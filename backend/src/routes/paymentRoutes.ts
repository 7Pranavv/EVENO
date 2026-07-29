import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

router.post("/create-order", requireAuth, createOrder);
router.post("/verify", requireAuth, verifyPayment);

export default router;