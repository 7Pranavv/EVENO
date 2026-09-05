import { Router } from "express";
import { getEscrowSummary } from "../controllers/adminController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/escrow", requireAuth, requireRole("admin"), getEscrowSummary);

export default router;
