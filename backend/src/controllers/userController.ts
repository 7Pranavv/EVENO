import { Request, Response } from "express";
import User from "../models/User";

// POST /api/users/sync — create or update the logged-in user's profile
export const syncUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const descopeId = req.user?.id;
    if (!descopeId) {
      res.status(401).json({ message: "Missing auth" });
      return;
    }

    const { name, email, role, college } = req.body;

    const user = await User.findOneAndUpdate(
      { descopeId },
      {
        $set: { name, email, role, ...(college !== undefined ? { college } : {}) },
        $setOnInsert: { descopeId, status: "active", joinedAt: new Date() },
      },
      { new: true, upsert: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/users/me
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ descopeId: req.user?.id });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/users/me — update own name/college
export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, college } = req.body;
    const user = await User.findOneAndUpdate(
      { descopeId: req.user?.id },
      { $set: { name, college } },
      { new: true }
    );
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET /api/users — admin: list all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ joinedAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// PUT /api/users/:id/status — admin: ban / unban
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!["active", "banned"].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
