import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env";
import Registration from "../models/Registration";

const razorpay = new Razorpay({
  key_id: env.razorpayKeyId,
  key_secret: env.razorpayKeySecret,
});

// POST /api/payments/create-order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  const { registrationId } = req.body;

  const registration = await Registration.findById(registrationId);
  if (!registration) {
    res.status(404).json({ message: "Registration not found" });
    return;
  }

  if (registration.participantId !== req.user?.id) {
    res.status(403).json({ message: "Not your registration" });
    return;
  }

  if (registration.paymentStatus === "paid") {
    res.status(400).json({ message: "Already paid" });
    return;
  }

  // The amount is taken from the stored registration, never from the request
  // body — a client-supplied amount lets anyone pay ₹1 for a ₹5000 event and
  // still produce a signature that verifies.
  const amount = registration.amount;
  if (!amount || amount <= 0) {
    res.status(400).json({ message: "Nothing to pay for this registration" });
    return;
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt: `receipt_${registrationId}`,
  });

  registration.orderId = order.id;
  await registration.save();

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.razorpayKeyId,
  });
};

// POST /api/payments/verify
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

  const registration = await Registration.findById(registrationId);
  if (!registration) {
    res.status(404).json({ message: "Registration not found" });
    return;
  }

  if (registration.participantId !== req.user?.id) {
    res.status(403).json({ message: "Not your registration" });
    return;
  }

  // Bind the signature to THIS registration's order. Without it a signature
  // from any real payment could be replayed against someone else's row.
  if (!registration.orderId || registration.orderId !== razorpay_order_id) {
    res.status(400).json({ message: "Order does not match this registration" });
    return;
  }

  const expectedSignature = crypto
    .createHmac("sha256", env.razorpayKeySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const provided = Buffer.from(String(razorpay_signature || ""), "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    registration.paymentStatus = "failed";
    await registration.save();
    res.status(400).json({ message: "Invalid payment signature" });
    return;
  }

  registration.paymentId = razorpay_payment_id;
  registration.paymentStatus = "paid";
  registration.status = "accepted";
  await registration.save();

  res.json({ message: "Payment verified", success: true });
};
