import express from "express";
import { createCompany, getCompanies, updateCompanyStatus } from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/companies - Get all companies (protected, super_admin only)
router.get("/", protect, getCompanies);

// POST /api/companies - Create a new company (protected, super_admin only)
router.post("/", protect, createCompany);

// PUT /api/companies/:id/status - Update company status (protected, super_admin only)
router.put("/:id/status", protect, updateCompanyStatus);

export default router;