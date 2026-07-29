// import { Request, Response } from "express";
// import Vendor from "../models/Vendor";
// import VendorService from "../models/VendorService";
// import Registration from "../models/Registration";

// // GET /api/vendors/:vendorId/stats
// export const getVendorStats = async (req: Request, res: Response) => {
//   try {
//     const { vendorId } = req.params;
//     const requests = await Registration.find({ vendorId });
//     const completed = requests.filter(r => r.status === "accepted");
//     const totalRevenue = completed.reduce((sum, r) => sum + (r.amount || 0), 0);

//     res.json({
//       totalEarnings: totalRevenue,
//       pendingRequests: requests.filter(r => r.status === "pending").length,
//       completedJobs: completed.length,
//       rating: 4.8,
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // GET /api/vendors/:vendorId/services
// export const getServices = async (req: Request, res: Response) => {
//   try {
//     const { vendorId } = req.params;
//     const services = await VendorService.find({ vendorId });
//     res.json(services);
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // POST /api/vendors/services
// export const addService = async (req: Request, res: Response) => {
//   try {
//     const service = await VendorService.create(req.body);
//     res.status(201).json(service);
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // PUT /api/vendors/services/:id
// export const updateService = async (req: Request, res: Response) => {
//   try {
//     const service = await VendorService.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(service);
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // DELETE /api/vendors/services/:id
// export const deleteService = async (req: Request, res: Response) => {
//   try {
//     await VendorService.findByIdAndDelete(req.params.id);
//     res.json({ message: "Deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // GET /api/vendors/:vendorId/requests
// export const getEventRequests = async (req: Request, res: Response) => {
//   try {
//     const { vendorId } = req.params;
//     const requests = await Registration.find({ vendorId }).sort({ registeredAt: -1 });
//     res.json(requests);
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };

// // GET /api/vendors/:vendorId/revenue
// export const getRevenue = async (req: Request, res: Response) => {
//   try {
//     const { vendorId } = req.params;
//     const registrations = await Registration.find({ vendorId, status: "accepted" });
//     res.json(registrations);
//   } catch (err) {
//     res.status(500).json({ message: "Error", error: err });
//   }
// };







import { Request, Response } from "express";
import Vendor from "../models/Vendor";
import VendorService from "../models/VendorService";
import Registration from "../models/Registration";

// GET /api/vendors/:vendorId/stats
export const getVendorStats = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const requests = await Registration.find({ vendorId });
    const completed = requests.filter(r => r.status === "accepted");
    const totalRevenue = completed.reduce((sum, r) => sum + (r.amount || 0), 0);
    const availableForPayout = completed
      .filter(r => !r.withdrawn)
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    res.json({
      totalEarnings: totalRevenue,
      availableForPayout,
      pendingRequests: requests.filter(r => r.status === "pending").length,
      completedJobs: completed.length,
      rating: 4.8,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// POST /api/vendors/:vendorId/withdraw — mark all payable earnings as withdrawn
export const withdrawEarnings = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    if (vendorId !== req.user?.id) {
      res.status(403).json({ message: "Not your earnings" });
      return;
    }

    const result = await Registration.updateMany(
      { vendorId, status: "accepted", withdrawn: { $ne: true } },
      { $set: { withdrawn: true } }
    );

    res.json({ message: "Withdrawal initiated", count: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// GET /api/vendors/services/all
export const getAllServices = async (req: Request, res: Response) => {
  try {
    const services = await VendorService.find({});
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// GET /api/vendors/:vendorId/services
export const getServices = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const services = await VendorService.find({ vendorId });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// POST /api/vendors/services
export const addService = async (req: Request, res: Response) => {
  try {
    const service = await VendorService.create({ ...req.body, vendorId: req.user?.id });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// PUT /api/vendors/services/:id
export const updateService = async (req: Request, res: Response) => {
  try {
    const existing = await VendorService.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Service not found" });
      return;
    }
    if (existing.vendorId !== req.user?.id) {
      res.status(403).json({ message: "Not your service" });
      return;
    }
    const service = await VendorService.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// DELETE /api/vendors/services/:id
export const deleteService = async (req: Request, res: Response) => {
  try {
    const existing = await VendorService.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Service not found" });
      return;
    }
    if (existing.vendorId !== req.user?.id) {
      res.status(403).json({ message: "Not your service" });
      return;
    }
    await VendorService.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// GET /api/vendors/:vendorId/requests
export const getEventRequests = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const requests = await Registration.find({ vendorId }).sort({ registeredAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

// GET /api/vendors/:vendorId/revenue
export const getRevenue = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const registrations = await Registration.find({ vendorId, status: "accepted" });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};