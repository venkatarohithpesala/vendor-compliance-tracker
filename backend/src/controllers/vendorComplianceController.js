import {
  VendorCompliance,
  Vendor,
  ComplianceRequirement,
  Company,
  ComplianceCategory,
} from "../models/index.js";

// Assign a compliance requirement to a vendor
export const assignComplianceRequirement = async (req, res) => {
  const { vendorId, requirementId } = req.body;

  try {
    // Validation
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required." });
    }

    if (!requirementId) {
      return res.status(400).json({ message: "Requirement ID is required." });
    }

    // Verify vendor exists and user has access
    const vendor = await Vendor.findByPk(vendorId, {
      include: [{ model: Company, as: "company" }],
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check permissions
    if (req.user.role === "admin" && vendor.companyId !== req.user.companyId) {
      return res.status(403).json({
        message:
          "Access denied. Can only assign requirements to vendors from your company.",
      });
    }

    // Verify requirement exists and is active
    const requirement = await ComplianceRequirement.findByPk(requirementId, {
      include: [{ model: ComplianceCategory, as: "category" }],
    });

    if (!requirement || !requirement.isActive) {
      return res
        .status(404)
        .json({ message: "Compliance requirement not found or inactive." });
    }

    // Check if this requirement is already assigned to this vendor
    const existingAssignment = await VendorCompliance.findOne({
      where: { vendorId, requirementId },
    });

    if (existingAssignment) {
      return res.status(409).json({
        message: "This requirement is already assigned to this vendor.",
      });
    }

    // Calculate next due date based on requirement frequency
    let nextDueDate = null;
    if (requirement.frequency !== "one-time" && requirement.defaultDueDate) {
      nextDueDate = new Date(requirement.defaultDueDate);
    } else if (requirement.frequency !== "one-time") {
      // Default to end of current year if no specific date set
      nextDueDate = new Date(new Date().getFullYear(), 11, 31);
    }

    // Create the assignment
    const vendorCompliance = await VendorCompliance.create({
      vendorId,
      requirementId,
      status: "pending",
      nextDueDate,
      assignedBy: req.user.email,
      createdBy: req.user.email,
    });

    // Fetch with associations
    const assignmentWithDetails = await VendorCompliance.findByPk(
      vendorCompliance.id,
      {
        include: [
          {
            model: Vendor,
            as: "vendor",
            attributes: ["id", "name", "email"],
          },
          {
            model: ComplianceRequirement,
            as: "requirement",
            include: [
              {
                model: ComplianceCategory,
                as: "category",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      }
    );

    res.status(201).json({
      message: "Compliance requirement assigned to vendor successfully.",
      assignment: {
        id: assignmentWithDetails.id,
        vendor: assignmentWithDetails.vendor,
        requirement: assignmentWithDetails.requirement,
        status: assignmentWithDetails.status,
        nextDueDate: assignmentWithDetails.nextDueDate,
        assignedBy: assignmentWithDetails.assignedBy,
        createdAt: assignmentWithDetails.createdAt,
      },
    });
  } catch (error) {
    console.error("Error assigning compliance requirement:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get compliance assignments for a vendor
export const getVendorCompliance = async (req, res) => {
  const { vendorId } = req.params;

  try {
    // Verify vendor exists and user has access
    const vendor = await Vendor.findByPk(vendorId, {
      include: [{ model: Company, as: "company" }],
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check permissions
    if (req.user.role === "admin" && vendor.companyId !== req.user.companyId) {
      return res.status(403).json({
        message:
          "Access denied. Can only view compliance for vendors from your company.",
      });
    }

    const complianceRecords = await VendorCompliance.findAll({
      where: { vendorId },
      include: [
        {
          model: ComplianceRequirement,
          as: "requirement",
          where: { isActive: true },
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
      },
      complianceRecords: complianceRecords.map((record) => ({
        id: record.id,
        requirement: record.requirement,
        status: record.status,
        complianceDate: record.complianceDate,
        expiryDate: record.expiryDate,
        nextDueDate: record.nextDueDate,
        notes: record.notes,
        documentUrls: record.documentUrls,
        assignedBy: record.assignedBy,
        reviewedBy: record.reviewedBy,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      })),
      total: complianceRecords.length,
    });
  } catch (error) {
    console.error("Error fetching vendor compliance:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update vendor compliance status
export const updateVendorCompliance = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    complianceDate,
    expiryDate,
    nextDueDate,
    notes,
    documentUrls,
  } = req.body;

  try {
    const complianceRecord = await VendorCompliance.findByPk(id, {
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
      return res.status(403).json({
        message:
          "Access denied. Can only update compliance for vendors from your company.",
      });
    }

    // Validate status
    const validStatuses = [
      "compliant",
      "non-compliant",
      "pending",
      "expired",
      "not-applicable",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Update the record
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (complianceDate !== undefined)
      updateData.complianceDate = complianceDate;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate;
    if (nextDueDate !== undefined) updateData.nextDueDate = nextDueDate;
    if (notes !== undefined) updateData.notes = notes;
    if (documentUrls !== undefined) updateData.documentUrls = documentUrls;
    if (status === "compliant" || status === "non-compliant") {
      updateData.reviewedBy = req.user.email;
    }
    updateData.updatedBy = req.user.email;

    await complianceRecord.update(updateData);

    // Fetch updated record with associations
    const updatedRecord = await VendorCompliance.findByPk(id, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name", "email"],
        },
        {
          model: ComplianceRequirement,
          as: "requirement",
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.json({
      message: "Compliance record updated successfully.",
      complianceRecord: {
        id: updatedRecord.id,
        vendor: updatedRecord.vendor,
        requirement: updatedRecord.requirement,
        status: updatedRecord.status,
        complianceDate: updatedRecord.complianceDate,
        expiryDate: updatedRecord.expiryDate,
        nextDueDate: updatedRecord.nextDueDate,
        notes: updatedRecord.notes,
        documentUrls: updatedRecord.documentUrls,
        assignedBy: updatedRecord.assignedBy,
        reviewedBy: updatedRecord.reviewedBy,
        createdAt: updatedRecord.createdAt,
        updatedAt: updatedRecord.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating vendor compliance:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Remove a compliance requirement from a vendor
export const removeVendorCompliance = async (req, res) => {
  const { id } = req.params;

  try {
    const complianceRecord = await VendorCompliance.findByPk(id, {
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
      return res.status(403).json({
        message:
          "Access denied. Can only remove compliance assignments for vendors from your company.",
      });
    }

    // Delete the record
    await complianceRecord.destroy();

    res.json({
      message: "Compliance requirement removed from vendor successfully.",
    });
  } catch (error) {
    console.error("Error removing vendor compliance:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all compliance assignments (for dashboard/overview)
export const getAllComplianceAssignments = async (req, res) => {
  try {
    let whereClause = {};

    // Filter by company for admin users
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res.status(403).json({
          message: "Access denied. Admin must be assigned to a company.",
        });
      }
      // Join with vendors to filter by company
      whereClause = {
        "$vendor.companyId$": req.user.companyId,
      };
    }

    const assignments = await VendorCompliance.findAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name", "email", "companyId"],
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
          where: { isActive: true },
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [
        ["nextDueDate", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        vendor: assignment.vendor,
        requirement: assignment.requirement,
        status: assignment.status,
        complianceDate: assignment.complianceDate,
        expiryDate: assignment.expiryDate,
        nextDueDate: assignment.nextDueDate,
        notes: assignment.notes,
        assignedBy: assignment.assignedBy,
        reviewedBy: assignment.reviewedBy,
        createdAt: assignment.createdAt,
      })),
      total: assignments.length,
    });
  } catch (error) {
    console.error("Error fetching compliance assignments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Bulk update compliance status
export const bulkUpdateComplianceStatus = async (req, res) => {
  const { assignmentIds, status, notes } = req.body;

  try {
    if (
      !assignmentIds ||
      !Array.isArray(assignmentIds) ||
      assignmentIds.length === 0
    ) {
      return res.status(400).json({ message: "Assignment IDs are required." });
    }

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    // Validate status
    const validStatuses = [
      "compliant",
      "non-compliant",
      "pending",
      "expired",
      "not-applicable",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Verify all assignments exist and user has access
    const assignments = await VendorCompliance.findAll({
      where: { id: assignmentIds },
      include: [
        {
          model: Vendor,
          as: "vendor",
          include: [{ model: Company, as: "company" }],
        },
      ],
    });

    if (assignments.length !== assignmentIds.length) {
      return res.status(404).json({ message: "Some assignments not found." });
    }

    // Check permissions for all assignments
    for (const assignment of assignments) {
      if (
        req.user.role === "admin" &&
        assignment.vendor.companyId !== req.user.companyId
      ) {
        return res.status(403).json({
          message:
            "Access denied. Can only update assignments for vendors from your company.",
        });
      }
    }

    // Update all assignments
    const updateData = {
      status,
      updatedBy: req.user.email,
    };

    if (status === "compliant" || status === "non-compliant") {
      updateData.reviewedBy = req.user.email;
      updateData.complianceDate = new Date();
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    await VendorCompliance.update(updateData, {
      where: { id: assignmentIds },
    });

    res.json({
      message: `${assignmentIds.length} compliance assignments updated successfully.`,
      updatedCount: assignmentIds.length,
    });
  } catch (error) {
    console.error("Error bulk updating compliance status:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get compliance statistics/summary
export const getComplianceStatistics = async (req, res) => {
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
        "$vendor.companyId$": req.user.companyId,
      };
    }

    // Get status counts
    const statusCounts = await VendorCompliance.findAll({
      where: whereClause,
      attributes: [
        "status",
        [
          VendorCompliance.sequelize.fn(
            "COUNT",
            VendorCompliance.sequelize.col("status")
          ),
          "count",
        ],
      ],
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [],
        },
        {
          model: ComplianceRequirement,
          as: "requirement",
          where: { isActive: true },
          attributes: [],
        },
      ],
      group: ["status"],
      raw: true,
    });

    // Get overdue count
    const overdueCount = await VendorCompliance.count({
      where: {
        ...whereClause,
        nextDueDate: {
          [VendorCompliance.sequelize.Op.lt]: new Date(),
        },
        status: {
          [VendorCompliance.sequelize.Op.notIn]: [
            "compliant",
            "not-applicable",
          ],
        },
      },
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: [],
        },
        {
          model: ComplianceRequirement,
          as: "requirement",
          where: { isActive: true },
          attributes: [],
        },
      ],
    });

    // Get vendor compliance rates
    const vendorStats = await VendorCompliance.findAll({
      where: whereClause,
      attributes: [
        [
          VendorCompliance.sequelize.fn(
            "COUNT",
            VendorCompliance.sequelize.col("VendorCompliance.id")
          ),
          "total",
        ],
        [
          VendorCompliance.sequelize.fn(
            "SUM",
            VendorCompliance.sequelize.literal(
              'CASE WHEN status = "compliant" THEN 1 ELSE 0 END'
            )
          ),
          "compliant",
        ],
      ],
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name"],
        },
        {
          model: ComplianceRequirement,
          as: "requirement",
          where: { isActive: true },
          attributes: [],
        },
      ],
      group: ["vendor.id", "vendor.name"],
      raw: true,
    });

    // Get category compliance rates
    const categoryStats = await VendorCompliance.findAll({
      where: whereClause,
      attributes: [
        [
          VendorCompliance.sequelize.fn(
            "COUNT",
            VendorCompliance.sequelize.col("VendorCompliance.id")
          ),
          "total",
        ],
        [
          VendorCompliance.sequelize.fn(
            "SUM",
            VendorCompliance.sequelize.literal(
              'CASE WHEN VendorCompliance.status = "compliant" THEN 1 ELSE 0 END'
            )
          ),
          "compliant",
        ],
      ],
      include: [
        {
          model: ComplianceRequirement,
          as: "requirement",
          where: { isActive: true },
          attributes: [],
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: Vendor,
          as: "vendor",
          attributes: [],
        },
      ],
      group: ["requirement.category.id", "requirement.category.name"],
      raw: true,
    });

    // Format statistics
    const stats = {
      totalAssignments: statusCounts.reduce(
        (sum, stat) => sum + parseInt(stat.count),
        0
      ),
      statusBreakdown: statusCounts.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.count);
        return acc;
      }, {}),
      overdueCount,
      vendorStats: vendorStats.map((stat) => ({
        vendorId: stat["vendor.id"],
        vendorName: stat["vendor.name"],
        total: parseInt(stat.total),
        compliant: parseInt(stat.compliant || 0),
        complianceRate: Math.round(
          (parseInt(stat.compliant || 0) / parseInt(stat.total)) * 100
        ),
      })),
      categoryStats: categoryStats.map((stat) => ({
        categoryId: stat["requirement.category.id"],
        categoryName: stat["requirement.category.name"],
        total: parseInt(stat.total),
        compliant: parseInt(stat.compliant || 0),
        complianceRate: Math.round(
          (parseInt(stat.compliant || 0) / parseInt(stat.total)) * 100
        ),
      })),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching compliance statistics:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get overdue assignments
export const getOverdueAssignments = async (req, res) => {
  try {
    let whereClause = {
      nextDueDate: {
        [VendorCompliance.sequelize.Op.lt]: new Date(),
      },
      status: {
        [VendorCompliance.sequelize.Op.notIn]: ["compliant", "not-applicable"],
      },
    };

    // Filter by company for admin users
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res.status(403).json({
          message: "Access denied. Admin must be assigned to a company.",
        });
      }
      whereClause["$vendor.companyId$"] = req.user.companyId;
    }

    const overdueAssignments = await VendorCompliance.findAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name", "email", "companyId"],
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
          where: { isActive: true },
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["nextDueDate", "ASC"]],
    });

    res.json({
      overdueAssignments: overdueAssignments.map((assignment) => ({
        id: assignment.id,
        vendor: assignment.vendor,
        requirement: assignment.requirement,
        status: assignment.status,
        nextDueDate: assignment.nextDueDate,
        daysOverdue: Math.floor(
          (new Date() - new Date(assignment.nextDueDate)) /
            (1000 * 60 * 60 * 24)
        ),
        assignedBy: assignment.assignedBy,
        createdAt: assignment.createdAt,
      })),
      total: overdueAssignments.length,
    });
  } catch (error) {
    console.error("Error fetching overdue assignments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get assignments by status
export const getAssignmentsByStatus = async (req, res) => {
  const { status } = req.params;

  try {
    // Validate status
    const validStatuses = [
      "compliant",
      "non-compliant",
      "pending",
      "expired",
      "not-applicable",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    let whereClause = { status };

    // Filter by company for admin users
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res.status(403).json({
          message: "Access denied. Admin must be assigned to a company.",
        });
      }
      whereClause["$vendor.companyId$"] = req.user.companyId;
    }

    const assignments = await VendorCompliance.findAll({
      where: whereClause,
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name", "email", "companyId"],
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
          where: { isActive: true },
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [
        ["nextDueDate", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      status,
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        vendor: assignment.vendor,
        requirement: assignment.requirement,
        status: assignment.status,
        complianceDate: assignment.complianceDate,
        expiryDate: assignment.expiryDate,
        nextDueDate: assignment.nextDueDate,
        notes: assignment.notes,
        assignedBy: assignment.assignedBy,
        reviewedBy: assignment.reviewedBy,
        createdAt: assignment.createdAt,
      })),
      total: assignments.length,
    });
  } catch (error) {
    console.error("Error fetching assignments by status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get a single compliance record by ID
export const getComplianceRecord = async (req, res) => {
  const { id } = req.params;

  try {
    const complianceRecord = await VendorCompliance.findByPk(id, {
      include: [
        {
          model: Vendor,
          as: "vendor",
          attributes: ["id", "name", "email", "companyId"],
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
          include: [
            {
              model: ComplianceCategory,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!complianceRecord) {
      return res.status(404).json({ message: "Compliance record not found." });
    }

    // Check permissions
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res.status(403).json({
          message: "Access denied. Admin must be assigned to a company.",
        });
      }

      if (complianceRecord.vendor.companyId !== req.user.companyId) {
        return res.status(403).json({
          message:
            "Access denied. Can only view compliance records for vendors from your company.",
        });
      }
    }

    // If user is vendor, they can only view their own compliance records
    if (
      req.user.role === "vendor" &&
      complianceRecord.vendorId !== req.user.vendorId
    ) {
      return res.status(403).json({
        message: "Access denied. Can only view your own compliance records.",
      });
    }

    res.json({
      compliance: {
        id: complianceRecord.id,
        vendorId: complianceRecord.vendorId,
        vendorName: complianceRecord.vendor.name,
        requirementId: complianceRecord.requirementId,
        requirementName: complianceRecord.requirement.name,
        categoryName: complianceRecord.requirement.category.name,
        status: complianceRecord.status,
        complianceDate: complianceRecord.complianceDate,
        expiryDate: complianceRecord.expiryDate,
        nextDueDate: complianceRecord.nextDueDate,
        notes: complianceRecord.notes,
        documentUrls: complianceRecord.documentUrls,
        assignedBy: complianceRecord.assignedBy,
        reviewedBy: complianceRecord.reviewedBy,
        createdAt: complianceRecord.createdAt,
        updatedAt: complianceRecord.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching compliance record:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
