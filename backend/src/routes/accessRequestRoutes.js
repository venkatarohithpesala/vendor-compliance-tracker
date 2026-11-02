import express from "express";
import {
  createAccessRequest,
  getAccessRequests,
  updateAccessRequestStatus,
} from "../controllers/accessRequestController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — anyone on login screen can submit
router.post("/", createAccessRequest);

// Protected — admin / super_admin only
router.get("/", protect, requireAdmin, getAccessRequests);
router.put("/:id/status", protect, requireAdmin, updateAccessRequestStatus);

export default router;
