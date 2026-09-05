import { Request, Response } from "express";
import User from "../models/User";

// Roles a user may pick for themselves. "admin" is deliberately absent —
// it can only be granted directly in the database.
const SELF_ASSIGNABLE_ROLES = ["organizer", "participant", "vendor"];

// POST /api/users/sync — create or update the logged-in user's profile
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  const descopeId = req.user?.id;
  if (!descopeId) {
    res.status(401).json({ message: "Missing auth" });
    return;
  }

  const { name, email, role, college } = req.body;

  if (role !== undefined && !SELF_ASSIGNABLE_ROLES.includes(role)) {
    res.status(400).json({ message: "Invalid role" });
    return;
  }

  const existing = await User.findOne({ descopeId });

  // An existing admin never gets demoted by a client sync call.
  const nextRole = existing?.role === "admin" ? "admin" : role ?? existing?.role ?? "participant";

  const user = await User.findOneAndUpdate(
    { descopeId },
    {
      $set: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(college !== undefined ? { college } : {}),
        role: nextRole,
      },
      $setOnInsert: { descopeId, status: "active", joinedAt: new Date() },
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(user);
};

// GET /api/users/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findOne({ descopeId: req.user?.id });
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};

// PUT /api/users/me — update own name/college
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  const { name, college } = req.body;
  const user = await User.findOneAndUpdate(
    { descopeId: req.user?.id },
    {
      $set: {
        ...(name !== undefined ? { name } : {}),
        ...(college !== undefined ? { college } : {}),
      },
    },
    { new: true, runValidators: true }
  );
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json(user);
};

// GET /api/users — admin only
export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await User.find().sort({ joinedAt: -1 });
  res.json(users);
};

// PUT /api/users/:id/status — admin only: ban / unban
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!["active", "banned"].includes(status)) {
    res.status(400).json({ message: "Invalid status" });
    return;
  }

  const target = await User.findById(req.params.id);
  if (!target) {
    res.status(404).json({ message: "User not found" });
    return;
  }

  if (target.descopeId === req.user?.id) {
    res.status(400).json({ message: "You cannot change your own status" });
    return;
  }

  target.status = status;
  await target.save();
  res.json(target);
};
