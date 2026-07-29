import { Request, Response } from "express";
import Event from "../models/Event";
import Registration from "../models/Registration";
import User from "../models/User";

// GET /api/admin/escrow — per-event collected amount + held/disbursed status
export const getEscrowSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    const registrations = await Registration.find({ paymentStatus: "paid" });
    const organizerIds = [...new Set(events.map((e) => e.organizerId).filter(Boolean))];
    const organizers = await User.find({ descopeId: { $in: organizerIds } });
    const organizerNameById = new Map(organizers.map((o) => [o.descopeId, o.name]));

    const summary = events
      .map((event) => {
        const collected = registrations
          .filter((r) => String(r.eventId) === String(event._id))
          .reduce((sum, r) => sum + (r.amount || 0), 0);

        return {
          eventId: event._id,
          event: event.title,
          organizer: organizerNameById.get(event.organizerId) || "Unknown",
          amount: collected,
          status: event.disbursed ? "disbursed" : "held",
          date: event.date,
        };
      })
      .filter((row) => row.amount > 0);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
