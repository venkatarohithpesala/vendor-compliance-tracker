"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Create Documents table
    await queryInterface.createTable("Documents", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      complianceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "VendorCompliance",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Reference to the compliance requirement assignment",
      },
      filename: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Unique filename stored in S3",
      },
      originalFilename: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Original filename as uploaded by user",
      },
      fileSize: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "File size in bytes",
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "MIME type of the file",
      },
      s3Key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "S3 object key/path",
      },
      s3Url: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Public S3 URL for the file",
      },
      documentType: {
        type: Sequelize.ENUM(
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
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Optional description of the document",
      },
      status: {
        type: Sequelize.ENUM("pending_review", "approved", "rejected"),
        defaultValue: "pending_review",
        allowNull: false,
        comment: "Review status of the document",
      },
      uploadedBy: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Email of user who uploaded the document",
      },
      reviewedBy: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Email of admin who reviewed the document",
      },
      reviewNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Notes from the reviewer",
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("Documents", ["complianceId"], {
      name: "documents_compliance_id_index",
    });

    await queryInterface.addIndex("Documents", ["status"], {
      name: "documents_status_index",
    });

    await queryInterface.addIndex("Documents", ["uploadedBy"], {
      name: "documents_uploaded_by_index",
    });

    await queryInterface.addIndex("Documents", ["documentType"], {
      name: "documents_type_index",
    });

    await queryInterface.addIndex("Documents", ["createdAt"], {
      name: "documents_created_at_index",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the Documents table
    await queryInterface.dropTable("Documents");
  },
};
