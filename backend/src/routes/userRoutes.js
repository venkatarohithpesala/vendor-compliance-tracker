import express from "express";
import {
  createAdmin,
  getAdmins,
  getAdmin,
  updateAdmin,
  deleteAdmin,
  acceptInvite,
  validateInviteToken,
} from "../controllers/userController.js";
import { protect, requireSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.get("/invite/:token", validateInviteToken);
router.post("/invite/:token/accept", acceptInvite);

// All other routes require authentication and super_admin role
router.use(protect);
router.use(requireSuperAdmin);

// GET /api/users/admins - Get all admin users (super_admin only)
router.get("/admins", getAdmins);

// GET /api/users/admins/:id - Get single admin user (super_admin only)
router.get("/admins/:id", getAdmin);

// POST /api/users/admins - Create a new admin user (super_admin only)
router.post("/admins", createAdmin);

// PUT /api/users/admins/:id - Update admin user (super_admin only)
router.put("/admins/:id", updateAdmin);

// DELETE /api/users/admins/:id - Delete admin user (super_admin only)
router.delete("/admins/:id", deleteAdmin);

export default router;