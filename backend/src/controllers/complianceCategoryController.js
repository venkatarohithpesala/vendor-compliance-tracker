import { ComplianceCategory } from "../models/index.js";

// Create a new compliance category
export const createComplianceCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({
          message: "Category name is required and must be a non-empty string.",
        });
    }

    // Check for existing category with same name
    const existingCategory = await ComplianceCategory.findOne({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return res
        .status(409)
        .json({ message: "A category with this name already exists." });
    }

    // Create the category
    const category = await ComplianceCategory.create({
      name: name.trim(),
      description: description ? description.trim() : null,
      createdBy: req.user.email,
    });

    res.status(201).json({
      message: "Compliance category created successfully.",
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating compliance category:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all compliance categories
export const getComplianceCategories = async (req, res) => {
  try {
    const categories = await ComplianceCategory.findAll({
      where: { isActive: true },
      order: [["name", "ASC"]],
    });

    res.json({
      categories: categories.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching compliance categories:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get a single compliance category by ID
export const getComplianceCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await ComplianceCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Compliance category not found." });
    }

    res.json({
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching compliance category:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update a compliance category
export const updateComplianceCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const category = await ComplianceCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Compliance category not found." });
    }

    // Validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return res.status(400).json({ message: "Category name must be a non-empty string." });
    }

    // Check for name conflicts if name is being changed
    if (name && name.trim() !== category.name) {
      const existingCategory = await ComplianceCategory.findOne({
        where: { name: name.trim() }
      });

      if (existingCategory) {
        return res
          .status(409)
          .json({ message: "A category with this name already exists." });
      }
    }

    // Update the category
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    updateData.updatedBy = req.user.email;

    await category.update(updateData);

    res.json({
      message: "Compliance category updated successfully.",
      category: {
        id: category.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdBy: category.createdBy,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating compliance category:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Delete (deactivate) a compliance category
export const deleteComplianceCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await ComplianceCategory.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Compliance category not found." });
    }

    // Soft delete by deactivating
    category.isActive = false;
    category.updatedBy = req.user.email;
    await category.save();

    res.json({
      message: "Compliance category deactivated successfully.",
    });
  } catch (error) {
    console.error("Error deleting compliance category:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};