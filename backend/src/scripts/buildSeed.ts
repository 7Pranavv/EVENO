import mongoose from "mongoose";
import {
  DEMO_PREFIX,
  organizers,
  vendors,
  attendeePool,
  events as demoEvents,
  services as demoServices,
  hires,
  DemoUser,
} from "./seedData";
import { planEvent } from "./seedPlan";

export const descopeIdFor = (key: string) => `${DEMO_PREFIX}${key}`;

// When --as is given, the demo identity matching that user's role is replaced
// by their real Descope id, so the seeded records show up in their own
// dashboard instead of a fictional one's.
export const PRIMARY_FOR_ROLE: Record<string, string> = {
  organizer:   "org-meera",
  vendor:      "ven-lensroom",
  participant: "par-ananya",
};

export interface SeedDocuments {
  users: Record<string, unknown>[];
  services: Record<string, unknown>[];
  events: Record<string, unknown>[];
  registrations: Record<string, unknown>[];
}

export interface BuildOptions {
  /** Demo key whose records belong to a real account instead. */
  claimedKey?: string;
  /** That account's Descope id. */
  claimedDescopeId?: string;
  /** That account's display name. */
  claimedName?: string;
  /** Fixes the "now" the ages are measured from, so builds are reproducible. */
  now?: number;
}

/**
 * Builds every document the seed will insert, without touching the database.
 * Keeping this pure is what lets the seed data be checked for internal
 * consistency (seat counts vs. registrations) in a plain unit test.
 */
export const buildSeedDocuments = (options: BuildOptions = {}): SeedDocuments => {
  const { claimedKey, claimedDescopeId, claimedName, now = Date.now() } = options;

  const allDemoUsers: DemoUser[] = [...organizers, ...vendors, ...attendeePool];

  const idByKey = new Map<string, string>();
  const nameByKey = new Map<string, string>();
  for (const user of allDemoUsers) {
    idByKey.set(user.key, descopeIdFor(user.key));
    nameByKey.set(user.key, user.name);
  }

  if (claimedKey && claimedDescopeId) {
    idByKey.set(claimedKey, claimedDescopeId);
    if (claimedName) nameByKey.set(claimedKey, claimedName);
  }

  // The claimed identity is skipped: that person already has a real account.
  const users = allDemoUsers
    .filter((u) => u.key !== claimedKey)
    .map((u, i) => ({
      descopeId: descopeIdFor(u.key),
      name:      u.name,
      email:     u.email,
      role:      u.role,
      college:   u.college ?? "",
      status:    u.status ?? "active",
      // Staggered rather than random so two builds match.
      joinedAt:  new Date(now - (30 + i * 17) * 24 * 60 * 60 * 1000),
      demo:      true,
    }));

  const services = demoServices.map((s) => ({
    vendorId:    idByKey.get(s.vendorKey)!,
    name:        s.name,
    description: s.description,
    price:       s.price,
    category:    s.category,
    available:   s.available ?? true,
    demo:        true,
  }));

  const events: Record<string, unknown>[] = [];
  const registrations: Record<string, unknown>[] = [];
  const eventIdByKey = new Map<string, mongoose.Types.ObjectId>();
  // Where in the attendee pool the next event starts drawing from. Advancing
  // it per event gives overlapping-but-different crowds, the way a real
  // campus circuit looks.
  let poolOffset = 0;

  for (const [index, demoEvent] of demoEvents.entries()) {
    const plan = planEvent(demoEvent, index + 1);
    const eventId = new mongoose.Types.ObjectId();
    eventIdByKey.set(demoEvent.key, eventId);

    events.push({
      _id:            eventId,
      title:          demoEvent.title,
      description:    demoEvent.description,
      date:           demoEvent.date,
      location:       demoEvent.location,
      category:       demoEvent.category,
      totalSeats:     demoEvent.totalSeats,
      availableSeats: plan.availableSeats,
      price:          demoEvent.price,
      organizerId:    idByKey.get(demoEvent.organizerKey)!,
      vendorId:       "",
      disbursed:      demoEvent.disbursed ?? false,
      demo:           true,
    });

    for (const row of plan.rows) {
      // Each seat goes to a different person. The pool is larger than any
      // single event, so this window never wraps onto itself and nobody ends
      // up registered for the same event twice.
      const participant = attendeePool[(poolOffset + row.participantIndex) % attendeePool.length];
      const collected = row.paid && demoEvent.price > 0;

      registrations.push({
        participantName: nameByKey.get(participant.key)!,
        participantId:   idByKey.get(participant.key)!,
        eventId,
        eventTitle:      demoEvent.title,
        amount:          demoEvent.price,
        vendorId:        "",
        isHireRequest:   false,
        seatClaimed:     row.seatClaimed,
        status:          row.paid ? "accepted" : "pending",
        paymentStatus:   collected ? "paid" : "unpaid",
        orderId:         collected ? `order_demo_${eventId}_${row.participantIndex}` : "",
        paymentId:       collected ? `pay_demo_${eventId}_${row.participantIndex}` : "",
        registeredAt:    new Date(now - row.ageMs),
        demo:            true,
      });
    }

    // Step the window on by a co-prime-ish stride so successive events don't
    // draw the identical crowd in the identical order.
    poolOffset = (poolOffset + plan.rows.length + 37) % attendeePool.length;
  }

  for (const [i, hire] of hires.entries()) {
    const eventId = eventIdByKey.get(hire.eventKey);
    const demoEvent = demoEvents.find((e) => e.key === hire.eventKey);
    if (!eventId || !demoEvent) continue;

    registrations.push({
      participantName: nameByKey.get(demoEvent.organizerKey)!,
      participantId:   idByKey.get(demoEvent.organizerKey)!,
      eventId,
      eventTitle:      demoEvent.title,
      amount:          hire.amount,
      vendorId:        idByKey.get(hire.vendorKey)!,
      isHireRequest:   true,
      seatClaimed:     false,       // hire requests never take an attendee seat
      status:          hire.status,
      paymentStatus:   hire.paid ? "paid" : "unpaid",
      // A row marked paid must carry the references a real payment would have
      // left behind, or the demo data contradicts itself.
      orderId:         hire.paid ? `order_demo_hire_${i}` : "",
      paymentId:       hire.paid ? `pay_demo_hire_${i}` : "",
      withdrawn:       hire.withdrawn ?? false,
      registeredAt:    new Date(now - (3 + i * 5) * 24 * 60 * 60 * 1000),
      demo:            true,
    });
  }

  return { users, services, events, registrations };
};
