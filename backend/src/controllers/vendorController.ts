import { Request, Response } from "express";
import VendorService from "../models/VendorService";
import Registration from "../models/Registration";

const ensureSelf = (req: Request, res: Response): boolean => {
  if (req.params.vendorId !== req.user?.id) {
    res.status(403).json({ message: "Forbidden" });
    return false;
  }
  return true;
};

// GET /api/vendors/:vendorId/stats
export const getVendorStats = async (req: Request, res: Response): Promise<void> => {
  if (!ensureSelf(req, res)) return;

  const requests = await Registration.find({ vendorId: req.params.vendorId });
  const completed = requests.filter((r) => r.status === "accepted");
  const totalEarnings = completed.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Only money actually collected is payable. Accepting a hire request does
  // not move funds, so counting unpaid rows here pays out money nobody sent.
  const availableForPayout = completed
    .filter((r) => r.paymentStatus === "paid" && !r.withdrawn)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  res.json({
    totalEarnings,
    availableForPayout,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
    completedJobs: completed.length,
  });
};

// POST /api/vendors/:vendorId/withdraw — mark collected earnings as withdrawn
export const withdrawEarnings = async (req: Request, res: Response): Promise<void> => {
  if (!ensureSelf(req, res)) return;

  // ponytail: flips a flag only — no real payout rail yet. Swap this for a
  // Razorpay Payouts call (inside a transaction) when money actually moves.
  const result = await Registration.updateMany(
    { vendorId: req.params.vendorId, status: "accepted", paymentStatus: "paid", withdrawn: { $ne: true } },
    { $set: { withdrawn: true } }
  );

  res.json({ message: "Withdrawal initiated", count: result.modifiedCount });
};

// GET /api/vendors/services/all — public marketplace listing
export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  const services = await VendorService.find({ available: true });
  res.json(services);
};

// GET /api/vendors/:vendorId/services
export const getServices = async (req: Request, res: Response): Promise<void> => {
  const services = await VendorService.find({ vendorId: req.params.vendorId });
  res.json(services);
};

// POST /api/vendors/services
export const addService = async (req: Request, res: Response): Promise<void> => {
  const { name, description, price, category, available } = req.body;

  const amount = Number(price);
  if (!name || !Number.isFinite(amount) || amount < 0) {
    res.status(400).json({ message: "name and a valid price are required" });
    return;
  }

  const service = await VendorService.create({
    vendorId:    req.user?.id,
    name,
    description: description ?? "",
    price:       amount,
    category:    category ?? "",
    available:   available ?? true,
  });

  res.status(201).json(service);
};

// PUT /api/vendors/services/:id
export const updateService = async (req: Request, res: Response): Promise<void> => {
  const existing = await VendorService.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  if (existing.vendorId !== req.user?.id) {
    res.status(403).json({ message: "Not your service" });
    return;
  }

  const { name, description, price, category, available } = req.body;
  if (price !== undefined) {
    const amount = Number(price);
    if (!Number.isFinite(amount) || amount < 0) {
      res.status(400).json({ message: "Invalid price" });
      return;
    }
    existing.price = amount;
  }
  if (name !== undefined) existing.name = name;
  if (description !== undefined) existing.description = description;
  if (category !== undefined) existing.category = category;
  if (available !== undefined) existing.available = available;

  await existing.save();
  res.json(existing);
};

// DELETE /api/vendors/services/:id
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  const existing = await VendorService.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "Service not found" });
    return;
  }
  if (existing.vendorId !== req.user?.id) {
    res.status(403).json({ message: "Not your service" });
    return;
  }
  await existing.deleteOne();
  res.json({ message: "Deleted" });
};

// GET /api/vendors/:vendorId/requests
export const getEventRequests = async (req: Request, res: Response): Promise<void> => {
  if (!ensureSelf(req, res)) return;
  const requests = await Registration.find({ vendorId: req.params.vendorId }).sort({ registeredAt: -1 });
  res.json(requests);
};

// GET /api/vendors/:vendorId/revenue
export const getRevenue = async (req: Request, res: Response): Promise<void> => {
  if (!ensureSelf(req, res)) return;
  const registrations = await Registration.find({ vendorId: req.params.vendorId, status: "accepted" });
  res.json(registrations);
};
