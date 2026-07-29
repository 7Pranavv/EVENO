import { Router } from "express";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  disburseEvent,
} from "../controllers/eventController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getAllEvents);
router.post("/", requireAuth, createEvent);
router.put("/:id", requireAuth, updateEvent);
router.put("/:id/disburse", requireAuth, disburseEvent);
router.delete("/:id", requireAuth, deleteEvent);
 
export default router;