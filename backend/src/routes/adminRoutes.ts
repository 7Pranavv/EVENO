import { Router } from "express";
import { getEscrowSummary } from "../controllers/adminController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/escrow", requireAuth, getEscrowSummary);

export default router;
