import { Request, Response } from "express";
import Event from "../models/Event";

// GET /api/events — Sabhi events
export const getAllEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// POST /api/events — Naya event create
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, date, location, totalSeats, availableSeats, price, description, category, vendorId } = req.body; // ← FIXED

    const event = new Event({
      title,
      date,
      location,
      totalSeats,
      availableSeats: availableSeats ?? totalSeats,
      price:        price ?? 0,           // ← ADDED
      description:  description ?? "",    // ← ADDED
      category:     category ?? "",       // ← ADDED
      vendorId:     vendorId ?? "",       // ← ADDED
      organizerId:  req.user?.id ?? "",   // ← set from verified session, not client input
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/events/:id — Event update (req.body se sab save hoga)
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Event.findById(id);

    if (!existing) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    // Legacy events without an organizerId stay editable by anyone (pre-auth data);
    // events with an owner can only be edited by that owner.
    if (existing.organizerId && existing.organizerId !== req.user?.id) {
      res.status(403).json({ message: "Not your event" });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/events/:id/disburse — Admin: release escrowed funds for an event
export const disburseEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { disbursed: true }, { new: true });
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE /api/events/:id — Event delete
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await Event.findById(id);

    if (!existing) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    if (existing.organizerId && existing.organizerId !== req.user?.id) {
      res.status(403).json({ message: "Not your event" });
      return;
    }

    await Event.findByIdAndDelete(id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};