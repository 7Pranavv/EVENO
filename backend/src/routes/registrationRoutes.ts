import { Router } from "express";
import {
  createRegistration,
  getAllRegistrations,
  getMyRegistrations,
  getRecentRegistrations,
  updateRegistrationStatus, // ← add karo
} from "../controllers/registrationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/",        requireAuth, createRegistration);
router.get("/",         getAllRegistrations);
router.get("/mine",     requireAuth, getMyRegistrations);
router.get("/recent",   getRecentRegistrations);
router.put("/:id",      requireAuth, updateRegistrationStatus); // ← add karo

export default router;