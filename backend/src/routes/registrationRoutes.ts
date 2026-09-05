import { Router } from "express";
import {
  createRegistration,
  getAllRegistrations,
  getMyRegistrations,
  getOrganizerRegistrations,
  cancelRegistration,
  updateRegistrationStatus,
} from "../controllers/registrationController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/",          requireAuth, createRegistration);
router.get("/",           requireAuth, requireRole("admin"), getAllRegistrations);
router.get("/mine",       requireAuth, getMyRegistrations);
router.get("/organizer",  requireAuth, requireRole("organizer"), getOrganizerRegistrations);
router.put("/:id",        requireAuth, updateRegistrationStatus);
router.delete("/:id",     requireAuth, cancelRegistration);

export default router;
