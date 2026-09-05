import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  disburseEvent,
} from "../controllers/eventController";
import { requireAuth, requireRole, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", optionalAuth, getAllEvents);
router.post("/", requireAuth, requireRole("organizer"), createEvent);
router.put("/:id", requireAuth, requireRole("organizer"), updateEvent);
router.put("/:id/disburse", requireAuth, requireRole("admin"), disburseEvent);
router.delete("/:id", requireAuth, requireRole("organizer"), deleteEvent);

export default router;
