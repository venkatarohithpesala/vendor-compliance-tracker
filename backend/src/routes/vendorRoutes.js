import express from "express";
import { createVendor, getVendors, getVendor, updateVendor, updateVendorStatus, deleteVendor } from "../controllers/vendorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/vendors - Get all vendors (filtered by company for admins)
router.get("/", protect, getVendors);

// GET /api/vendors/:id - Get a single vendor
router.get("/:id", protect, getVendor);

// POST /api/vendors - Create a new vendor
router.post("/", protect, createVendor);

// PUT /api/vendors/:id - Update vendor
router.put("/:id", protect, updateVendor);

// PUT /api/vendors/:id/status - Update vendor status
router.put("/:id/status", protect, updateVendorStatus);

// DELETE /api/vendors/:id - Delete vendor
router.delete("/:id", protect, deleteVendor);

export default router;