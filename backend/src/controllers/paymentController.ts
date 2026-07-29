import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Registration from "../models/Registration";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST /api/payments/create-order
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, registrationId } = req.body;

    const options = {
      amount: amount * 100, // paise mein
      currency: "INR",
      receipt: `receipt_${registrationId}`,
    };

    const order = await razorpay.orders.create(options);

    // Registration mein orderId save karo
    await Registration.findByIdAndUpdate(registrationId, {
      orderId: order.id,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: "Order create failed", error });
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, registrationId } = req.body;

    // Signature verify karo
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400).json({ message: "Invalid payment signature" });
      return;
    }

    // Registration update karo
    await Registration.findByIdAndUpdate(registrationId, {
      paymentId: razorpay_payment_id,
      paymentStatus: "paid",
      status: "accepted",
    });

    res.json({ message: "Payment verified ✅", success: true });
  } catch (error) {
    res.status(500).json({ message: "Verification failed", error });
  }
};