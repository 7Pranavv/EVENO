import Registration from "../models/Registration";
import Event from "../models/Event";

// A registration claims a seat the moment it's created, before the payment
// sheet even opens. If the user abandons checkout and the browser never gets
// to release it (tab closed, connection dropped), that seat would be held
// forever. This hands back anything still unpaid after the grace period.
const GRACE_MS = 15 * 60 * 1000;

export const releaseStaleSeats = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - GRACE_MS);

  const stale = await Registration.find({
    seatClaimed: true,
    paymentStatus: "unpaid",
    status: "pending",
    amount: { $gt: 0 },          // free registrations are complete on creation
    registeredAt: { $lt: cutoff },
  });

  for (const registration of stale) {
    // Re-claim this row first, so two workers can't both return the seat.
    const taken = await Registration.findOneAndUpdate(
      { _id: registration._id, seatClaimed: true },
      { $set: { seatClaimed: false, status: "rejected" } }
    );
    if (!taken) continue;

    await Event.findByIdAndUpdate(registration.eventId, { $inc: { availableSeats: 1 } });
  }

  return stale.length;
};

// ponytail: in-process timer, so every instance runs its own sweep. The
// re-claim above keeps that correct, just slightly wasteful. Move to a single
// scheduled job if this ever runs on more than a couple of nodes.
export const startStaleSeatSweeper = (): void => {
  const run = () => {
    releaseStaleSeats().catch((err) => console.error("Stale seat sweep failed:", err));
  };
  run();
  setInterval(run, 5 * 60 * 1000).unref();
};
