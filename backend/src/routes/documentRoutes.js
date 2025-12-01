import express from "express";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import {
  uploadDocument,
  getComplianceDocuments,
  getAllDocuments,
  reviewDocument,
  downloadDocument,
  deleteDocument,
} from "../controllers/documentController.js";

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for S3 upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "text/plain",
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type ${file.mimetype} not allowed. Allowed types: PDF, DOC, DOCX, JPG, PNG, TXT, CSV, XLSX`
        ),
        false
      );
    }
  },
});

const router = express.Router();

// Document Routes
// POST /api/documents/upload/:complianceId - Upload document for compliance requirement
router.post(
  "/upload/:complianceId",
  protect,
  upload.single("document"),
  uploadDocument
);

// GET /api/documents/compliance/:complianceId - Get documents for a compliance record
router.get("/compliance/:complianceId", protect, getComplianceDocuments);

// GET /api/documents - Get all documents (admin view)
router.get("/", protect, requireAdmin, getAllDocuments);

// PUT /api/documents/review/:id - Review document (approve/reject)
router.put("/review/:id", protect, requireAdmin, reviewDocument);

// GET /api/documents/download/:id - Download document
router.get("/download/:id", protect, downloadDocument);

// DELETE /api/documents/:id - Delete document
router.delete("/:id", protect, requireAdmin, deleteDocument);

export default router;
