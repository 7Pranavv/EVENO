// import express from "express";
// import {
//   getServices,
//   addService,
//   updateService,
//   deleteService,
//   getEventRequests,
//   getRevenue,
//   getVendorStats,
// }              from "../controllers/vendorController";

// const router = express.Router();

// // Services
// router.get("/:vendorId/services", getServices);
// router.post("/services", addService);
// router.put("/services/:id", updateService);
// router.delete("/services/:id", deleteService);

// // Event Requests
// router.get("/:vendorId/requests", getEventRequests);

// // Revenue
// router.get("/:vendorId/revenue", getRevenue);

// // Stats
// router.get("/:vendorId/stats", getVendorStats);

// export default router;






import express from "express";
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
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// Services
router.get("/services/all", getAllServices);
router.get("/:vendorId/services", getServices);
router.post("/services", requireAuth, addService);
router.put("/services/:id", requireAuth, updateService);
router.delete("/services/:id", requireAuth, deleteService);

// Event Requests
router.get("/:vendorId/requests", getEventRequests);

// Revenue
router.get("/:vendorId/revenue", getRevenue);

// Stats
router.get("/:vendorId/stats", getVendorStats);

// Withdraw
router.post("/:vendorId/withdraw", requireAuth, withdrawEarnings);

export default router;