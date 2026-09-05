import { DemoEvent } from "./seedData";

// The sweeper reclaims any seat held by an unpaid, pending, priced
// registration older than 15 minutes (src/jobs/releaseStaleSeats.ts). Demo
// rows in that state are stamped "just now" so they survive long enough to be
// worth looking at; anything older would silently vanish minutes after seeding.
export const UNPAID_AGE_MS = 2 * 60 * 1000;

export interface PlannedRegistration {
  participantIndex: number;
  paid: boolean;
  seatClaimed: boolean;
  ageMs: number;         // how far in the past registeredAt should sit
}

export interface EventPlan {
  availableSeats: number;
  rows: PlannedRegistration[];
}

// Deterministic PRNG so re-seeding produces the same database twice.
const mulberry32 = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Turn a demo event into a consistent set of registrations plus the seat count
 * that must accompany them. `availableSeats` is derived from the rows rather
 * than written by hand, so the dashboards can never show 300 seats left next
 * to 400 registrations.
 */
export const planEvent = (event: DemoEvent, seed = 1): EventPlan => {
  const wanted = Math.max(0, Math.min(event.registrations, event.totalSeats));
  const paid = Math.max(0, Math.min(event.paid, wanted));
  const random = mulberry32(seed);

  const rows: PlannedRegistration[] = [];

  for (let i = 0; i < wanted; i++) {
    const isPaid = i < paid;
    rows.push({
      participantIndex: i,
      paid: isPaid,
      // Every row in this set is still holding its seat; rejected and
      // cancelled registrations are simply not generated.
      seatClaimed: true,
      ageMs: isPaid
        // Spread paid registrations back over roughly three months.
        ? Math.floor(random() * 90 * 24 * 60 * 60 * 1000)
        : Math.floor(random() * UNPAID_AGE_MS),
    });
  }

  return { availableSeats: event.totalSeats - rows.length, rows };
};
