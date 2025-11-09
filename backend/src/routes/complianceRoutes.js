import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createComplianceCategory,
  getComplianceCategories,
  getComplianceCategory,
  updateComplianceCategory,
  deleteComplianceCategory,
} from "../controllers/complianceCategoryController.js";

import {
  createComplianceRequirement,
  getComplianceRequirements,
  getComplianceRequirement,
  updateComplianceRequirement,
  deleteComplianceRequirement,
} from "../controllers/complianceRequirementController.js";

import {
  assignComplianceRequirement,
  getVendorCompliance,
  updateVendorCompliance,
  removeVendorCompliance,
  getAllComplianceAssignments,
  bulkUpdateComplianceStatus,
  getComplianceStatistics,
  getOverdueAssignments,
  getAssignmentsByStatus,
  getComplianceRecord,
} from "../controllers/vendorComplianceController.js";

const router = express.Router();

// Compliance Categories Routes
// GET /api/compliance/categories - Get all active compliance categories
router.get("/categories", protect, getComplianceCategories);

// POST /api/compliance/categories - Create a new compliance category
router.post("/categories", protect, createComplianceCategory);

// GET /api/compliance/categories/:id - Get a specific compliance category
router.get("/categories/:id", protect, getComplianceCategory);

// PUT /api/compliance/categories/:id - Update a compliance category
router.put("/categories/:id", protect, updateComplianceCategory);

// DELETE /api/compliance/categories/:id - Deactivate a compliance category
router.delete("/categories/:id", protect, deleteComplianceCategory);

// Compliance Requirements Routes
// GET /api/compliance/requirements - Get all active compliance requirements (optional category filter)
router.get("/requirements", protect, getComplianceRequirements);

// POST /api/compliance/requirements - Create a new compliance requirement
router.post("/requirements", protect, createComplianceRequirement);

// GET /api/compliance/requirements/:id - Get a specific compliance requirement
router.get("/requirements/:id", protect, getComplianceRequirement);

// PUT /api/compliance/requirements/:id - Update a compliance requirement
router.put("/requirements/:id", protect, updateComplianceRequirement);

// DELETE /api/compliance/requirements/:id - Deactivate a compliance requirement
router.delete("/requirements/:id", protect, deleteComplianceRequirement);

// Vendor Compliance Routes
// GET /api/compliance/assignments - Get all compliance assignments (for dashboard)
router.get("/assignments", protect, getAllComplianceAssignments);

// POST /api/compliance/assignments - Assign a requirement to a vendor
router.post("/assignments", protect, assignComplianceRequirement);

// GET /api/compliance/vendors/:vendorId - Get compliance records for a specific vendor
router.get("/vendors/:vendorId", protect, getVendorCompliance);

// PUT /api/compliance/assignments/:id - Update a compliance assignment status
router.put("/assignments/:id", protect, updateVendorCompliance);

// DELETE /api/compliance/assignments/:id - Remove a compliance assignment
router.delete("/assignments/:id", protect, removeVendorCompliance);

// PUT /api/compliance/assignments/bulk - Bulk update compliance status
router.put("/assignments/bulk", protect, bulkUpdateComplianceStatus);

// GET /api/compliance/statistics - Get compliance statistics and summary
router.get("/statistics", protect, getComplianceStatistics);

// GET /api/compliance/overdue - Get overdue compliance assignments
router.get("/overdue", protect, getOverdueAssignments);

// GET /api/compliance/status/:status - Get assignments by status
router.get("/status/:status", protect, getAssignmentsByStatus);

// GET /api/compliance/:id - Get a single compliance record
router.get("/:id", protect, getComplianceRecord);

export default router;
