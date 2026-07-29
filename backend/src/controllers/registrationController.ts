// import { Request, Response } from "express";
// import Registration from "../models/Registration";
// import Event from "../models/Event";
 
// // POST /api/registrations — Register for event
// export const createRegistration = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { participantName, eventId, amount } = req.body;
 
//     // Event dhundo
//     const event = await Event.findById(eventId);
//     if (!event) {
//       res.status(404).json({ message: "Event not found" });
//       return;
//     }
 
//     // Seats check karo
//     if (event.availableSeats <= 0) {
//       res.status(400).json({ message: "No seats available" });
//       return;
//     }
 
//     // Registration banao
//     const registration = new Registration({
//       participantName,
//       eventId: event._id,
//       eventTitle: event.title,
//       amount: amount ?? 0,
//       registeredAt: new Date(),
//     });
 
//     await registration.save();
 
//     // Seats kam karo
//     event.availableSeats -= 1;
//     await event.save();
 
//     res.status(201).json(registration);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
 
// // GET /api/registrations — Sabhi registrations
// export const getAllRegistrations = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const registrations = await Registration.find().sort({ registeredAt: -1 });
//     res.json(registrations);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
 
// // GET /api/registrations/recent — Last 5 registrations
// export const getRecentRegistrations = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const recent = await Registration.find().sort({ registeredAt: -1 }).limit(5);
//     res.json(recent);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };














import { Request, Response } from "express";
import Registration from "../models/Registration";
import Event from "../models/Event";

// POST /api/registrations — Register for event
export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { participantName, eventId, amount, vendorId, isHireRequest } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Vendor hire requests don't consume attendee seats — only real
    // participant registrations do, so skip the seat claim for those.
    if (!isHireRequest) {
      // Atomic check-and-decrement so concurrent registrations can't oversell seats.
      const claimed = await Event.findOneAndUpdate(
        { _id: eventId, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { new: true }
      );

      if (!claimed) {
        res.status(400).json({ message: "No seats available" });
        return;
      }
    }

    const registration = new Registration({
      participantName,
      participantId: req.user?.id,
      eventId:      event._id,
      eventTitle:   event.title,
      amount:       amount ?? event.price ?? 0,
      vendorId:     vendorId ?? event.vendorId ?? "",
      status:       "pending",
      registeredAt: new Date(),
    });

    await registration.save();

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/registrations — Sabhi registrations
export const getAllRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/registrations/mine — Sirf logged-in participant ke registrations
export const getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrations = await Registration.find({ participantId: req.user?.id }).sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/registrations/recent — Last 5 registrations
export const getRecentRegistrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const recent = await Registration.find().sort({ registeredAt: -1 }).limit(5);
    res.json(recent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/registrations/:id — Accept / Reject / vendorId update
export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Registration.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    // Legacy registrations without a vendorId stay editable (pre-auth data);
    // registrations already assigned to a vendor can only be actioned by that vendor.
    if (existing.vendorId && existing.vendorId !== req.user?.id) {
      res.status(403).json({ message: "Not your hire request" });
      return;
    }

    const updateData: any = {};

    // ✅ status update — optional
    if (req.body.status) {
      if (!["accepted", "rejected", "pending"].includes(req.body.status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }
      updateData.status = req.body.status;
    }

    // ✅ vendorId update — optional
    if (req.body.vendorId !== undefined) {
      updateData.vendorId = req.body.vendorId;
    }

    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!registration) {
      res.status(404).json({ message: "Registration not found" });
      return;
    }

    res.json(registration);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};