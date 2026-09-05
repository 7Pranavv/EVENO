import { Request, Response } from "express";
import Registration from "../models/Registration";
import Event from "../models/Event";

// POST /api/registrations — Register for an event, or (organizers only) send a vendor hire request
export const createRegistration = async (req: Request, res: Response): Promise<void> => {
  const { participantName, eventId, amount, vendorId } = req.body;

  // Derived from the verified session role, never from req.body — a
  // client-supplied flag here skips the seat check and lets anyone register
  // for a sold-out event.
  const isHireRequest = req.user?.role === "organizer";

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Event not found" });
    return;
  }

  if (isHireRequest && event.organizerId && event.organizerId !== req.user?.id) {
    res.status(403).json({ message: "Not your event" });
    return;
  }

  const requestedAmount = isHireRequest ? Number(amount) : (event.price ?? 0);
  if (!Number.isFinite(requestedAmount) || requestedAmount < 0) {
    res.status(400).json({ message: "Invalid amount" });
    return;
  }

  if (!participantName) {
    res.status(400).json({ message: "participantName is required" });
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

  try {
    const registration = await Registration.create({
      participantName,
      participantId: req.user?.id,
      eventId:      event._id,
      eventTitle:   event.title,
      amount:       requestedAmount,
      vendorId:     vendorId ?? event.vendorId ?? "",
      isHireRequest,
      seatClaimed:  !isHireRequest,
      status:       "pending",
      registeredAt: new Date(),
    });

    res.status(201).json(registration);
  } catch (error) {
    // Give the seat back rather than leaking it on a failed insert.
    if (!isHireRequest) {
      await Event.findByIdAndUpdate(eventId, { $inc: { availableSeats: 1 } });
    }
    throw error;
  }
};

// Return a claimed seat exactly once. The flag is cleared with an atomic
// findOneAndUpdate rather than an in-memory check, so two concurrent
// rejections of the same registration can't both hand the seat back and
// inflate the event's capacity.
const releaseSeat = async (registration: any): Promise<void> => {
  const won = await Registration.findOneAndUpdate(
    { _id: registration._id, seatClaimed: true },
    { $set: { seatClaimed: false } }
  );

  registration.seatClaimed = false;
  if (!won) return; // someone else already released it

  await Event.findByIdAndUpdate(registration.eventId, { $inc: { availableSeats: 1 } });
};

// GET /api/registrations — admin only
export const getAllRegistrations = async (_req: Request, res: Response): Promise<void> => {
  const registrations = await Registration.find().sort({ registeredAt: -1 });
  res.json(registrations);
};

// GET /api/registrations/mine — the logged-in participant's own registrations
export const getMyRegistrations = async (req: Request, res: Response): Promise<void> => {
  const registrations = await Registration.find({ participantId: req.user?.id }).sort({ registeredAt: -1 });
  res.json(registrations);
};

// GET /api/registrations/organizer — every registration across the caller's own events
export const getOrganizerRegistrations = async (req: Request, res: Response): Promise<void> => {
  const events = await Event.find({ organizerId: req.user?.id }).select("_id");
  const registrations = await Registration.find({
    eventId: { $in: events.map((e) => e._id) },
  }).sort({ registeredAt: -1 });
  res.json(registrations);
};

// DELETE /api/registrations/:id — participant cancels their own unpaid registration
export const cancelRegistration = async (req: Request, res: Response): Promise<void> => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    res.status(404).json({ message: "Registration not found" });
    return;
  }

  if (registration.participantId !== req.user?.id) {
    res.status(403).json({ message: "Not your registration" });
    return;
  }

  if (registration.paymentStatus === "paid") {
    res.status(400).json({ message: "Paid registrations cannot be cancelled here" });
    return;
  }

  await releaseSeat(registration);
  await registration.deleteOne();

  res.json({ message: "Registration cancelled" });
};

// Who may action a registration: the vendor it was addressed to, or the
// organizer of the event it belongs to.
//
// The empty cases are the whole point. An earlier version wrote this as
// `if (vendorId && vendorId !== userId) reject` — which let ANY logged-in user
// through whenever vendorId was empty, and empty is the normal state for an
// attendee registration on an event with no vendor. Blank ids must never match.
export const whoCanAction = (
  registrationVendorId: string | undefined,
  eventOrganizerId: string | undefined,
  userId: string | undefined
): { isAssignedVendor: boolean; isOwningOrganizer: boolean } => ({
  isAssignedVendor:   !!userId && !!registrationVendorId && registrationVendorId === userId,
  isOwningOrganizer:  !!userId && !!eventOrganizerId && eventOrganizerId === userId,
});

// PUT /api/registrations/:id — the assigned vendor accepts / rejects a hire
// request, or the owning organizer actions an attendee registration.
export const updateRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
  const registration = await Registration.findById(req.params.id);
  if (!registration) {
    res.status(404).json({ message: "Registration not found" });
    return;
  }

  const event = await Event.findById(registration.eventId).select("organizerId");
  const { isAssignedVendor, isOwningOrganizer } = whoCanAction(
    registration.vendorId,
    event?.organizerId,
    req.user?.id
  );

  if (!isAssignedVendor && !isOwningOrganizer) {
    res.status(403).json({ message: "Not yours to action" });
    return;
  }

  if (req.body.status !== undefined) {
    if (!["accepted", "rejected", "pending"].includes(req.body.status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    // A rejected attendee registration must hand its seat back.
    if (req.body.status === "rejected") {
      await releaseSeat(registration);
    }
    registration.status = req.body.status;
  }

  // Reassigning the vendor is the organizer's call, not the vendor's.
  if (req.body.vendorId !== undefined) {
    if (!isOwningOrganizer) {
      res.status(403).json({ message: "Only the event organizer can reassign the vendor" });
      return;
    }
    registration.vendorId = req.body.vendorId;
  }

  await registration.save();
  res.json(registration);
};
