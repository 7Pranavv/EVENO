import { test } from "node:test";
import assert from "node:assert/strict";
import { pickEditable } from "./controllers/eventController";
import { whoCanAction } from "./controllers/registrationController";
import { requireRole } from "./middleware/auth";

// Fake just enough of Express to observe what the guard does.
const runGuard = (role: string | undefined, allowed: string[]) => {
  let status = 0;
  let nexted = false;
  const res = { status(code: number) { status = code; return this; }, json() { return this; } };
  requireRole(...allowed)({ user: role ? { id: "u1", role } : undefined } as any, res as any, () => { nexted = true; });
  return { status, nexted };
};

test("requireRole lets a matching role through", () => {
  assert.deepEqual(runGuard("admin", ["admin"]), { status: 0, nexted: true });
});

test("requireRole rejects a non-matching role", () => {
  assert.deepEqual(runGuard("participant", ["admin"]), { status: 403, nexted: false });
});

test("requireRole rejects a user with no role at all", () => {
  assert.deepEqual(runGuard(undefined, ["admin"]), { status: 403, nexted: false });
});

test("pickEditable keeps organizer-editable fields", () => {
  assert.deepEqual(pickEditable({ title: "Fest", price: 200 }), { title: "Fest", price: 200 });
});

test("pickEditable drops privileged fields", () => {
  const out = pickEditable({ title: "Fest", disbursed: true, organizerId: "someone-else", _id: "x" });
  assert.deepEqual(out, { title: "Fest" });
});

test("pickEditable ignores undefined without inventing keys", () => {
  assert.deepEqual(pickEditable({ title: undefined }), {});
});

test("whoCanAction recognises the assigned vendor", () => {
  assert.deepEqual(whoCanAction("vendor-1", "org-1", "vendor-1"), {
    isAssignedVendor: true,
    isOwningOrganizer: false,
  });
});

test("whoCanAction recognises the owning organizer", () => {
  assert.deepEqual(whoCanAction("vendor-1", "org-1", "org-1"), {
    isAssignedVendor: false,
    isOwningOrganizer: true,
  });
});

test("whoCanAction rejects an unrelated user", () => {
  assert.deepEqual(whoCanAction("vendor-1", "org-1", "someone-else"), {
    isAssignedVendor: false,
    isOwningOrganizer: false,
  });
});

// The regression that shipped: an empty vendorId used to let everyone in.
test("whoCanAction denies everyone when the registration has no vendor", () => {
  assert.deepEqual(whoCanAction("", "org-1", "random-user"), {
    isAssignedVendor: false,
    isOwningOrganizer: false,
  });
  assert.deepEqual(whoCanAction(undefined, "org-1", "random-user"), {
    isAssignedVendor: false,
    isOwningOrganizer: false,
  });
});

test("whoCanAction denies a legacy event with no organizer", () => {
  assert.deepEqual(whoCanAction("", "", "random-user"), {
    isAssignedVendor: false,
    isOwningOrganizer: false,
  });
});

test("whoCanAction never matches an anonymous caller against blank ids", () => {
  assert.deepEqual(whoCanAction("", "", undefined), {
    isAssignedVendor: false,
    isOwningOrganizer: false,
  });
});
