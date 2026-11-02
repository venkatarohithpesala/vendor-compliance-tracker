import express from "express";
import { createVendor, getVendors, getVendor, updateVendor, updateVendorStatus, deleteVendor } from "../controllers/vendorController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/vendors - Get all vendors (filtered by company for admins)
router.get("/", protect, requireAdmin, getVendors);

// GET /api/vendors/:id - Get a single vendor
router.get("/:id", protect, requireAdmin, getVendor);

// POST /api/vendors - Create a new vendor
router.post("/", protect, requireAdmin, createVendor);

// PUT /api/vendors/:id - Update vendor
router.put("/:id", protect, requireAdmin, updateVendor);

// PUT /api/vendors/:id/status - Update vendor status
router.put("/:id/status", protect, requireAdmin, updateVendorStatus);

// DELETE /api/vendors/:id - Delete vendor
router.delete("/:id", protect, requireAdmin, deleteVendor);

export default router;