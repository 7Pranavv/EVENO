import { Request, Response } from "express";
import Event from "../models/Event";
import Registration from "../models/Registration";
import User from "../models/User";

// GET /api/admin/escrow — per-event collected amount + held/disbursed status
export const getEscrowSummary = async (_req: Request, res: Response): Promise<void> => {
  const events = await Event.find().sort({ createdAt: -1 });
  const registrations = await Registration.find({ paymentStatus: "paid" });

  const organizerIds = [...new Set(events.map((e) => e.organizerId).filter(Boolean))];
  const organizers = await User.find({ descopeId: { $in: organizerIds } });
  const organizerNameById = new Map(organizers.map((o) => [o.descopeId, o.name]));

  const collectedByEvent = new Map<string, number>();
  for (const reg of registrations) {
    const key = String(reg.eventId);
    collectedByEvent.set(key, (collectedByEvent.get(key) || 0) + (reg.amount || 0));
  }

  const summary = events
    .map((event) => ({
      eventId:   event._id,
      event:     event.title,
      organizer: organizerNameById.get(event.organizerId) || "Unknown",
      amount:    collectedByEvent.get(String(event._id)) || 0,
      status:    event.disbursed ? "disbursed" : "held",
      date:      event.date,
    }))
    .filter((row) => row.amount > 0);

  res.json(summary);
};
