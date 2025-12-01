import { ComplianceRequirement, ComplianceCategory } from "../models/index.js";

// Create a new compliance requirement
export const createComplianceRequirement = async (req, res) => {
  const { name, description, categoryId, frequency, defaultDueDate, renewalPeriodMonths } = req.body;

  try {
    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({
          message: "Requirement name is required and must be a non-empty string.",
        });
    }

    if (!categoryId) {
      return res
        .status(400)
        .json({ message: "Category ID is required." });
    }

    // Validate frequency
    const validFrequencies = ['one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return res
        .status(400)
        .json({ message: "Invalid frequency. Must be one of: " + validFrequencies.join(', ') });
    }

    // Verify category exists, is active, and belongs to user's company
    const category = await ComplianceCategory.findByPk(categoryId);
    if (!category || !category.isActive) {
      return res.status(404).json({ message: "Compliance category not found or inactive." });
    }

    // Check if category belongs to user's company (unless super_admin)
    if (req.user.role !== 'super_admin' && category.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "Access denied. You can only create requirements for categories in your company." });
    }

    // Create the requirement
    const requirement = await ComplianceRequirement.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      categoryId: categoryId,
      companyId: category.companyId, // Use category's company
      frequency: frequency || 'annual',
      defaultDueDate: defaultDueDate || null,
      renewalPeriodMonths: renewalPeriodMonths || null,
      createdBy: req.user.email,
    });

    // Fetch with associations
    const requirementWithCategory = await ComplianceRequirement.findByPk(requirement.id, {
      include: [
        {
          model: ComplianceCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(201).json({
      message: "Compliance requirement created successfully.",
      requirement: {
        id: requirementWithCategory.id,
        name: requirementWithCategory.name,
        description: requirementWithCategory.description,
        category: requirementWithCategory.category,
        frequency: requirementWithCategory.frequency,
        defaultDueDate: requirementWithCategory.defaultDueDate,
        renewalPeriodMonths: requirementWithCategory.renewalPeriodMonths,
        isActive: requirementWithCategory.isActive,
        createdBy: requirementWithCategory.createdBy,
        createdAt: requirementWithCategory.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating compliance requirement:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all compliance requirements
export const getComplianceRequirements = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const whereClause = { isActive: true };

    // Filter by user's company unless super_admin
    if (req.user.role !== 'super_admin') {
      whereClause.companyId = req.user.companyId;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const requirements = await ComplianceRequirement.findAll({
      where: whereClause,
      include: [
        {
          model: ComplianceCategory,
          as: 'category',
          attributes: ['id', 'name'],
          where: req.user.role !== 'super_admin' ? { companyId: req.user.companyId } : {},
          required: true
        }
      ],
      order: [["name", "ASC"]],
    });

    res.json({
      requirements: requirements.map(requirement => ({
        id: requirement.id,
        name: requirement.name,
        description: requirement.description,
        category: requirement.category,
        frequency: requirement.frequency,
        defaultDueDate: requirement.defaultDueDate,
        renewalPeriodMonths: requirement.renewalPeriodMonths,
        isActive: requirement.isActive,
        createdBy: requirement.createdBy,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      })),
      total: requirements.length,
    });
  } catch (error) {
    console.error("Error fetching compliance requirements:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get a single compliance requirement by ID
export const getComplianceRequirement = async (req, res) => {
  const { id } = req.params;

  try {
    const requirement = await ComplianceRequirement.findByPk(id, {
      include: [
        {
          model: ComplianceCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    if (!requirement) {
      return res.status(404).json({ message: "Compliance requirement not found." });
    }

    // Check if requirement belongs to user's company (unless super_admin)
    if (req.user.role !== 'super_admin' && requirement.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "Access denied. You can only view requirements from your company." });
    }

    res.json({
      requirement: {
        id: requirement.id,
        name: requirement.name,
        description: requirement.description,
        category: requirement.category,
        frequency: requirement.frequency,
        defaultDueDate: requirement.defaultDueDate,
        renewalPeriodMonths: requirement.renewalPeriodMonths,
        isActive: requirement.isActive,
        createdBy: requirement.createdBy,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching compliance requirement:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update a compliance requirement
export const updateComplianceRequirement = async (req, res) => {
  const { id } = req.params;
  const { name, description, categoryId, frequency, defaultDueDate, renewalPeriodMonths } = req.body;

  try {
    const requirement = await ComplianceRequirement.findByPk(id);

    if (!requirement) {
      return res.status(404).json({ message: "Compliance requirement not found." });
    }

    // Check if requirement belongs to user's company (unless super_admin)
    if (req.user.role !== 'super_admin' && requirement.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "Access denied. You can only update requirements from your company." });
    }

    // Validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return res.status(400).json({ message: "Requirement name must be a non-empty string." });
    }

    // Validate frequency
    const validFrequencies = ['one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return res
        .status(400)
        .json({ message: "Invalid frequency. Must be one of: " + validFrequencies.join(', ') });
    }

    // Verify category exists and is active if categoryId is being changed
    if (categoryId && categoryId !== requirement.categoryId) {
      const category = await ComplianceCategory.findByPk(categoryId);
      if (!category || !category.isActive) {
        return res.status(404).json({ message: "Compliance category not found or inactive." });
      }
    }

    // Update the requirement
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (defaultDueDate !== undefined) updateData.defaultDueDate = defaultDueDate;
    if (renewalPeriodMonths !== undefined) updateData.renewalPeriodMonths = renewalPeriodMonths;
    updateData.updatedBy = req.user.email;

    await requirement.update(updateData);

    // Fetch updated requirement with associations
    const updatedRequirement = await ComplianceRequirement.findByPk(id, {
      include: [
        {
          model: ComplianceCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      message: "Compliance requirement updated successfully.",
      requirement: {
        id: updatedRequirement.id,
        name: updatedRequirement.name,
        description: updatedRequirement.description,
        category: updatedRequirement.category,
        frequency: updatedRequirement.frequency,
        defaultDueDate: updatedRequirement.defaultDueDate,
        renewalPeriodMonths: updatedRequirement.renewalPeriodMonths,
        isActive: updatedRequirement.isActive,
        createdBy: updatedRequirement.createdBy,
        createdAt: updatedRequirement.createdAt,
        updatedAt: updatedRequirement.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating compliance requirement:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Delete (deactivate) a compliance requirement
export const deleteComplianceRequirement = async (req, res) => {
  const { id } = req.params;

  try {
    const requirement = await ComplianceRequirement.findByPk(id);

    if (!requirement) {
      return res.status(404).json({ message: "Compliance requirement not found." });
    }

    // Check if requirement belongs to user's company (unless super_admin)
    if (req.user.role !== 'super_admin' && requirement.companyId !== req.user.companyId) {
      return res.status(403).json({ message: "Access denied. You can only delete requirements from your company." });
    }

    // Soft delete by deactivating
    requirement.isActive = false;
    requirement.updatedBy = req.user.email;
    await requirement.save();

    res.json({
      message: "Compliance requirement deactivated successfully.",
    });
  } catch (error) {
    console.error("Error deleting compliance requirement:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};