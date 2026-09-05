import { Router } from "express";
import { syncUser, getMe, updateMe, getAllUsers, updateUserStatus } from "../controllers/userController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.post("/sync",      requireAuth, syncUser);
router.get("/me",         requireAuth, getMe);
router.put("/me",         requireAuth, updateMe);
router.get("/",           requireAuth, requireRole("admin"), getAllUsers);
router.put("/:id/status", requireAuth, requireRole("admin"), updateUserStatus);

export default router;
