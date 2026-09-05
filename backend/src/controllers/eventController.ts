import { Request, Response } from "express";
import Event from "../models/Event";

// Fields an organizer is allowed to set. Passing req.body straight to
// findByIdAndUpdate would let them flip `disbursed`, reassign `organizerId`,
// or invent seats.
const EDITABLE_FIELDS = ["title", "date", "location", "totalSeats", "availableSeats", "description", "price", "category", "vendorId"] as const;

export const pickEditable = (body: any): Record<string, unknown> => {
  const out: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (body[field] !== undefined) out[field] = body[field];
  }
  return out;
};

// GET /api/events — all events, or ?mine=true for the caller's own
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  const filter: Record<string, unknown> = {};

  if (req.query.mine === "true") {
    if (!req.user?.id) {
      res.status(401).json({ message: "Login required" });
      return;
    }
    filter.organizerId = req.user.id;
  }

  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.q) {
    // Escape the search term — passing raw user input as a regex lets a
    // caller send something like "(a+)+$" and pin the database thread.
    const escaped = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: escaped, $options: "i" };
  }

  const limit = Math.min(Number(req.query.limit) || 100, 100);
  const skip = Math.max(Number(req.query.skip) || 0, 0);

  const events = await Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
  res.json(events);
};

// POST /api/events
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const { title, date, location, totalSeats, availableSeats, price, description, category, vendorId } = req.body;

  const seats = Number(totalSeats);
  if (!title || !date || !location || !Number.isFinite(seats) || seats < 0) {
    res.status(400).json({ message: "title, date, location and a valid totalSeats are required" });
    return;
  }

  const open = availableSeats === undefined ? seats : Number(availableSeats);
  if (!Number.isFinite(open) || open < 0 || open > seats) {
    res.status(400).json({ message: "availableSeats must be between 0 and totalSeats" });
    return;
  }

  const amount = price === undefined ? 0 : Number(price);
  if (!Number.isFinite(amount) || amount < 0) {
    res.status(400).json({ message: "Invalid price" });
    return;
  }

  const event = await Event.create({
    title,
    date,
    location,
    totalSeats:     seats,
    availableSeats: open,
    price:          amount,
    description:    description ?? "",
    category:       category ?? "",
    vendorId:       vendorId ?? "",
    organizerId:    req.user?.id ?? "",   // from the verified session, not client input
  });

  res.status(201).json(event);
};

// PUT /api/events/:id
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  const existing = await Event.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (existing.organizerId !== req.user?.id) {
    res.status(403).json({ message: "Not your event" });
    return;
  }

  const updates = pickEditable(req.body);
  const total = updates.totalSeats !== undefined ? Number(updates.totalSeats) : existing.totalSeats;
  const open  = updates.availableSeats !== undefined ? Number(updates.availableSeats) : existing.availableSeats;

  if (!Number.isFinite(total) || !Number.isFinite(open) || open < 0 || open > total) {
    res.status(400).json({ message: "availableSeats must be between 0 and totalSeats" });
    return;
  }

  const updated = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json(updated);
};

// PUT /api/events/:id/disburse — admin only (enforced on the route)
export const disburseEvent = async (req: Request, res: Response): Promise<void> => {
  const event = await Event.findByIdAndUpdate(req.params.id, { disbursed: true }, { new: true });
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }
  res.json(event);
};

// DELETE /api/events/:id
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  const existing = await Event.findById(req.params.id);
  if (!existing) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (existing.organizerId !== req.user?.id) {
    res.status(403).json({ message: "Not your event" });
    return;
  }

  await existing.deleteOne();
  res.json({ message: "Event deleted successfully" });
};
