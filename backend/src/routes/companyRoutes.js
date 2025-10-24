import express from "express";
import { createCompany, getCompanies } from "../controllers/companyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/companies - Get all companies (protected, super_admin only)
router.get("/", protect, getCompanies);

// POST /api/companies - Create a new company (protected, super_admin only)
router.post("/", protect, createCompany);

export default router;