import { Router } from "express";
import {
  getServices,
  addService,
  updateService,
  deleteService,
  getEventRequests,
  getRevenue,
  getVendorStats,
  getAllServices,
  withdrawEarnings,
} from "../controllers/vendorController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Public marketplace
router.get("/services/all", getAllServices);
router.get("/:vendorId/services", getServices);

// Vendor's own service catalogue
router.post("/services",       requireAuth, requireRole("vendor"), addService);
router.put("/services/:id",    requireAuth, requireRole("vendor"), updateService);
router.delete("/services/:id", requireAuth, requireRole("vendor"), deleteService);

// Vendor's own books — self-scoped in the controller
router.get("/:vendorId/requests",  requireAuth, getEventRequests);
router.get("/:vendorId/revenue",   requireAuth, getRevenue);
router.get("/:vendorId/stats",     requireAuth, getVendorStats);
router.post("/:vendorId/withdraw", requireAuth, requireRole("vendor"), withdrawEarnings);

export default router;
