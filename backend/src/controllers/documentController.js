import {
  Document,
  VendorCompliance,
  Vendor,
  ComplianceRequirement,
  Company,
} from "../models/index.js";
import {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
} from "../services/s3Service.js";
import fs from "fs";
import path from "path";

// Upload document for compliance requirement
export const uploadDocument = async (req, res) => {
  try {
    const { complianceId } = req.params;
    const { documentType, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Verify compliance record exists and user has access
    const complianceRecord = await VendorCompliance.findByPk(complianceId, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          include: [{ model: Company, as: "company" }],
        },
        { model: ComplianceRequirement, as: "requirement" },
      ],
    });

    if (!complianceRecord) {
      return res.status(404).json({ message: "Compliance record not found." });
    }

    // Check permissions
    if (
      req.user.role === "admin" &&
      complianceRecord.vendor.companyId !== req.user.companyId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only upload documents for vendors from your company.",
        });
    }

    // If user is vendor, they can only upload for their own compliance records
    if (
      req.user.role === "vendor" &&
      complianceRecord.vendorId !== req.user.vendorId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only upload documents for your own compliance records.",
        });
    }

    // Validate file type
    const allowedTypes = [
      "pdf",
      "doc",
      "docx",
      "jpg",
      "jpeg",
      "png",
      "txt",
      "csv",
      "xlsx",
    ];
    const fileExtension = path
      .extname(file.originalname)
      .toLowerCase()
      .replace(".", "");

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        message: `File type not allowed. Allowed types: ${allowedTypes.join(
          ", "
        )}`,
      });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return res.status(400).json({ message: "File size exceeds 10MB limit." });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${complianceId}_${timestamp}_${file.originalname}`;

    // Upload to S3
    const s3Key = `compliance/${complianceRecord.vendorId}/${uniqueFilename}`;
    const uploadResult = await uploadToS3(file.buffer, s3Key, file.mimetype);

    // Save document record to database
    const document = await Document.create({
      complianceId,
      filename: uniqueFilename,
      originalFilename: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      s3Key,
      s3Url: uploadResult.Location,
      documentType: documentType || "compliance_evidence",
      description: description || "",
      uploadedBy: req.user.email,
      status: "pending_review", // pending_review, approved, rejected
      createdBy: req.user.email,
    });

    // Clean up temp file if it exists
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(201).json({
      message: "Document uploaded successfully.",
      document: {
        id: document.id,
        filename: document.filename,
        originalFilename: document.originalFilename,
        fileSize: document.fileSize,
        mimeType: document.mimeType,
        documentType: document.documentType,
        description: document.description,
        status: document.status,
        uploadedBy: document.uploadedBy,
        s3Url: document.s3Url,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get documents for a compliance record
export const getComplianceDocuments = async (req, res) => {
  try {
    const { complianceId } = req.params;

    // Verify compliance record exists and user has access
    const complianceRecord = await VendorCompliance.findByPk(complianceId, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          include: [{ model: Company, as: "company" }],
        },
      ],
    });

    if (!complianceRecord) {
      return res.status(404).json({ message: "Compliance record not found." });
    }

    // Check permissions
    if (
      req.user.role === "admin" &&
      complianceRecord.vendor.companyId !== req.user.companyId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only view documents for vendors from your company.",
        });
    }

    // If user is vendor, they can only view their own documents
    if (
      req.user.role === "vendor" &&
      complianceRecord.vendorId !== req.user.vendorId
    ) {
      return res
        .status(403)
        .json({ message: "Access denied. Can only view your own documents." });
    }

    const documents = await Document.findAll({
      where: { complianceId },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      complianceId,
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        originalFilename: doc.originalFilename,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        description: doc.description,
        status: doc.status,
        uploadedBy: doc.uploadedBy,
        reviewedBy: doc.reviewedBy,
        reviewNotes: doc.reviewNotes,
        s3Url: doc.s3Url,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching compliance documents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get all documents (admin view)
export const getAllDocuments = async (req, res) => {
  try {
    let whereClause = {};

    // Filter by company for admin users
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res.status(403).json({
          message: "Access denied. Admin must be assigned to a company.",
        });
      }
      whereClause = {
        "$compliance.vendor.companyId$": req.user.companyId,
      };
    }

    const documents = await Document.findAll({
      where: whereClause,
      include: [
        {
          model: VendorCompliance,
          as: "compliance",
          include: [
            {
              model: Vendor,
              as: "vendor",
              attributes: ["id", "name", "email"],
              include: [
                {
                  model: Company,
                  as: "company",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: ComplianceRequirement,
              as: "requirement",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        filename: doc.filename,
        originalFilename: doc.originalFilename,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        documentType: doc.documentType,
        description: doc.description,
        status: doc.status,
        uploadedBy: doc.uploadedBy,
        reviewedBy: doc.reviewedBy,
        reviewNotes: doc.reviewNotes,
        s3Url: doc.s3Url,
        compliance: doc.compliance,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      total: documents.length,
    });
  } catch (error) {
    console.error("Error fetching all documents:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Review document (approve/reject)
export const reviewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    // Validate status
    const validStatuses = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'approved' or 'rejected'.",
      });
    }

    const document = await Document.findByPk(id, {
      include: [
        {
          model: VendorCompliance,
          as: "compliance",
          include: [
            {
              model: Vendor,
              as: "vendor",
              include: [{ model: Company, as: "company" }],
            },
          ],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Check permissions (only admins can review)
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Only admins can review documents." });
    }

    if (
      req.user.role === "admin" &&
      document.compliance.vendor.companyId !== req.user.companyId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only review documents for vendors from your company.",
        });
    }

    // Update document status
    document.status = status;
    document.reviewedBy = req.user.email;
    document.reviewNotes = reviewNotes || "";
    document.updatedBy = req.user.email;

    await document.save();

    // If approved, update compliance status to compliant
    if (status === "approved") {
      await VendorCompliance.update(
        {
          status: "compliant",
          complianceDate: new Date(),
          reviewedBy: req.user.email,
          updatedBy: req.user.email,
        },
        { where: { id: document.complianceId } }
      );
    }

    res.json({
      message: `Document ${status} successfully.`,
      document: {
        id: document.id,
        status: document.status,
        reviewedBy: document.reviewedBy,
        reviewNotes: document.reviewNotes,
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error reviewing document:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: VendorCompliance,
          as: "compliance",
          include: [
            {
              model: Vendor,
              as: "vendor",
              include: [{ model: Company, as: "company" }],
            },
          ],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Check permissions
    if (
      req.user.role === "admin" &&
      document.compliance.vendor.companyId !== req.user.companyId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only download documents for vendors from your company.",
        });
    }

    if (
      req.user.role === "vendor" &&
      document.compliance.vendorId !== req.user.vendorId
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied. Can only download your own documents.",
        });
    }

    // Generate signed URL for download
    const signedUrl = await getSignedUrl(document.s3Key);

    res.json({
      downloadUrl: signedUrl,
      filename: document.originalFilename,
      expiresIn: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Error generating download URL:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findByPk(id, {
      include: [
        {
          model: VendorCompliance,
          as: "compliance",
          include: [
            {
              model: Vendor,
              as: "vendor",
              include: [{ model: Company, as: "company" }],
            },
          ],
        },
      ],
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Check permissions
    if (
      req.user.role === "admin" &&
      document.compliance.vendor.companyId !== req.user.companyId
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Can only delete documents for vendors from your company.",
        });
    }

    if (
      req.user.role === "vendor" &&
      document.compliance.vendorId !== req.user.vendorId
    ) {
      return res
        .status(403)
        .json({
          message: "Access denied. Can only delete your own documents.",
        });
    }

    // Delete from S3
    await deleteFromS3(document.s3Key);

    // Delete from database
    await document.destroy();

    res.json({
      message: "Document deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};
