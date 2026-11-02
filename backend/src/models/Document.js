import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Document = sequelize.define(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    complianceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "VendorCompliance",
        key: "id",
      },
      comment: "Reference to the compliance requirement assignment",
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Unique filename stored in S3",
    },
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Original filename as uploaded by user",
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "File size in bytes",
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "MIME type of the file",
    },
    s3Key: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "S3 object key/path",
    },
    s3Url: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Public S3 URL for the file",
    },
    documentType: {
      type: DataTypes.ENUM(
        "compliance_evidence",
        "certificate",
        "license",
        "insurance",
        "audit_report",
        "financial_statement",
        "contract",
        "policy",
        "training_certificate",
        "other"
      ),
      defaultValue: "compliance_evidence",
      allowNull: false,
      comment: "Type/category of the document",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Optional description of the document",
    },
    status: {
      type: DataTypes.ENUM("pending_review", "approved", "rejected"),
      defaultValue: "pending_review",
      allowNull: false,
      comment: "Review status of the document",
    },
    uploadedBy: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "Email of user who uploaded the document",
    },
    reviewedBy: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Email of admin who reviewed the document",
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Notes from the reviewer",
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Documents",
    timestamps: true,
    indexes: [
      {
        fields: ["complianceId"],
        name: "idx_documents_compliance_id",
      },
      {
        fields: ["status"],
        name: "idx_documents_status",
      },
      {
        fields: ["uploadedBy"],
        name: "idx_documents_uploaded_by",
      },
      {
        fields: ["documentType"],
        name: "idx_documents_type",
      },
    ],
  }
);

export default Document;
