import { test } from "node:test";
import assert from "node:assert/strict";
import { planEvent, UNPAID_AGE_MS } from "./seedPlan";
import { events as demoEvents, DemoEvent } from "./seedData";

const build = (over: Partial<DemoEvent> = {}): DemoEvent => ({
  key: "t", organizerKey: "org-meera", title: "T", description: "",
  date: "2026-01-01", location: "Mumbai", category: "Technology",
  totalSeats: 100, price: 500, registrations: 60, paid: 50,
  ...over,
});

test("availableSeats always matches the rows generated", () => {
  const plan = planEvent(build());
  assert.equal(plan.rows.length, 60);
  assert.equal(plan.availableSeats, 40);
  assert.equal(plan.availableSeats + plan.rows.length, 100);
});

test("registrations can never exceed the seats on sale", () => {
  const plan = planEvent(build({ totalSeats: 20, registrations: 500, paid: 500 }));
  assert.equal(plan.rows.length, 20);
  assert.equal(plan.availableSeats, 0);
});

test("paid count is capped at the number of registrations", () => {
  const plan = planEvent(build({ registrations: 10, paid: 99 }));
  assert.equal(plan.rows.filter((r) => r.paid).length, 10);
});

test("a sold-out event leaves no seats", () => {
  const plan = planEvent(build({ totalSeats: 50, registrations: 50, paid: 50 }));
  assert.equal(plan.availableSeats, 0);
});

test("an event with no registrations keeps every seat", () => {
  const plan = planEvent(build({ registrations: 0, paid: 0 }));
  assert.deepEqual(plan, { availableSeats: 100, rows: [] });
});

// Unpaid rows older than the sweeper's 15-minute grace period get their seats
// reclaimed, which would quietly change the demo data after seeding.
test("unpaid rows are recent enough to survive the stale-seat sweeper", () => {
  const plan = planEvent(build({ registrations: 60, paid: 50 }));
  const unpaid = plan.rows.filter((r) => !r.paid);

  assert.equal(unpaid.length, 10);
  for (const row of unpaid) {
    assert.ok(row.ageMs < UNPAID_AGE_MS, `unpaid row aged ${row.ageMs}ms would be swept`);
  }
});

test("planning is deterministic for a given seed", () => {
  assert.deepEqual(planEvent(build(), 7), planEvent(build(), 7));
});

test("every shipped demo event is internally consistent", () => {
  for (const [i, event] of demoEvents.entries()) {
    const plan = planEvent(event, i + 1);
    assert.equal(
      plan.availableSeats + plan.rows.length,
      event.totalSeats,
      `${event.title}: seats do not add up`
    );
    assert.ok(plan.availableSeats >= 0, `${event.title}: negative seats`);
    assert.ok(
      plan.rows.filter((r) => r.paid).length <= plan.rows.length,
      `${event.title}: more paid than registered`
    );
  }
});

test("free events have no unpaid stragglers", () => {
  for (const event of demoEvents.filter((e) => e.price === 0)) {
    assert.equal(event.paid, event.registrations, `${event.title}: a free event cannot be part-paid`);
  }
});
