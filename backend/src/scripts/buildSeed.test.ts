import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSeedDocuments, descopeIdFor } from "./buildSeed";
import { UNPAID_AGE_MS } from "./seedPlan";

const NOW = Date.UTC(2026, 0, 15);
const docs = buildSeedDocuments({ now: NOW });

const attendees = docs.registrations.filter((r) => !r.isHireRequest);
const hireRows  = docs.registrations.filter((r) => r.isHireRequest);

test("every event's seat count matches its actual registrations", () => {
  for (const event of docs.events) {
    const claimed = attendees.filter(
      (r) => String(r.eventId) === String(event._id) && r.seatClaimed
    ).length;

    assert.equal(
      Number(event.availableSeats) + claimed,
      Number(event.totalSeats),
      `${event.title}: ${claimed} seats taken but ${event.availableSeats} of ${event.totalSeats} shown free`
    );
  }
});

test("no event oversells or shows negative seats", () => {
  for (const event of docs.events) {
    assert.ok(Number(event.availableSeats) >= 0, `${event.title}: negative seats`);
    assert.ok(
      Number(event.availableSeats) <= Number(event.totalSeats),
      `${event.title}: more free seats than exist`
    );
  }
});

test("nobody is registered for the same event twice", () => {
  for (const event of docs.events) {
    const forEvent = attendees.filter((r) => String(r.eventId) === String(event._id));
    const distinct = new Set(forEvent.map((r) => r.participantId));

    assert.equal(
      distinct.size,
      forEvent.length,
      `${event.title}: ${forEvent.length} registrations from only ${distinct.size} people`
    );
  }
});

test("the attendee pool outgrows the largest event", () => {
  const biggest = Math.max(
    ...docs.events.map((e) => attendees.filter((r) => String(r.eventId) === String(e._id)).length)
  );
  const people = new Set(attendees.map((r) => r.participantId)).size;

  assert.ok(people > biggest, `pool of ${people} cannot fill an event of ${biggest} with distinct people`);
});

test("no single attendee has an implausible number of registrations", () => {
  const perPerson = new Map<unknown, number>();
  for (const row of attendees) {
    perPerson.set(row.participantId, (perPerson.get(row.participantId) ?? 0) + 1);
  }

  const worst = Math.max(...perPerson.values());
  assert.ok(worst <= docs.events.length, `someone is registered ${worst} times across ${docs.events.length} events`);
});

test("hire requests never consume an attendee seat", () => {
  assert.ok(hireRows.length > 0);
  for (const row of hireRows) {
    assert.equal(row.seatClaimed, false, "a hire request is holding a seat");
  }
});

test("a registration's payment fields agree with its status", () => {
  for (const row of docs.registrations) {
    if (row.paymentStatus === "paid") {
      assert.ok(Number(row.amount) > 0, "a paid row with a zero amount");
      assert.ok(row.orderId, "a paid row with no order id");
      assert.ok(row.paymentId, "a paid row with no payment id");
    }
    if (row.paymentStatus === "unpaid") {
      assert.equal(row.paymentId, "", "an unpaid row carrying a payment id");
    }
  }
});

test("free registrations are never marked paid", () => {
  for (const row of attendees.filter((r) => Number(r.amount) === 0)) {
    assert.equal(row.paymentStatus, "unpaid", "free rows should match what the real flow produces");
  }
});

// The sweeper reclaims unpaid, pending, priced seats older than 15 minutes.
test("unpaid priced rows are recent enough to survive the stale-seat sweeper", () => {
  const atRisk = attendees.filter(
    (r) => r.seatClaimed && r.paymentStatus === "unpaid" && r.status === "pending" && Number(r.amount) > 0
  );

  assert.ok(atRisk.length > 0, "expected some unpaid rows for realism");
  for (const row of atRisk) {
    const age = NOW - (row.registeredAt as Date).getTime();
    assert.ok(age < UNPAID_AGE_MS, `an unpaid row aged ${age}ms would be swept away`);
  }
});

test("every record is tagged demo so a reset can find it", () => {
  const all = [...docs.users, ...docs.services, ...docs.events, ...docs.registrations];
  assert.ok(all.length > 0);
  for (const doc of all) {
    assert.equal(doc.demo, true);
  }
});

test("demo emails are all unroutable", () => {
  for (const user of docs.users) {
    assert.match(String(user.email), /@(.+\.)?example\.com$/, `${user.email} could reach a real inbox`);
  }
});

test("every owner id points at a demo identity by default", () => {
  for (const event of docs.events) {
    assert.match(String(event.organizerId), /^demo-/);
  }
  for (const service of docs.services) {
    assert.match(String(service.vendorId), /^demo-/);
  }
});

test("--as hands the claimed role's records to the real account", () => {
  const claimed = buildSeedDocuments({
    claimedKey: "org-meera",
    claimedDescopeId: "descope-real-user",
    claimedName: "Real Person",
    now: NOW,
  });

  const theirs = claimed.events.filter((e) => e.organizerId === "descope-real-user");
  assert.ok(theirs.length > 0, "the real account got no events");

  // Their demo counterpart must not also exist as a user row.
  assert.equal(
    claimed.users.filter((u) => u.descopeId === descopeIdFor("org-meera")).length,
    0,
    "the claimed demo user was created as well, duplicating the account"
  );

  // The other organizer is untouched.
  assert.ok(claimed.events.some((e) => e.organizerId === descopeIdFor("org-arjun")));
});

test("building twice with the same clock gives the same documents", () => {
  const a = buildSeedDocuments({ now: NOW });
  const b = buildSeedDocuments({ now: NOW });

  // _id is freshly generated each run, so compare everything else.
  const strip = (rows: Record<string, unknown>[]) =>
    rows.map(({ _id, eventId, orderId, paymentId, ...rest }) => rest);

  assert.deepEqual(strip(a.events), strip(b.events));
  assert.deepEqual(strip(a.registrations), strip(b.registrations));
});
