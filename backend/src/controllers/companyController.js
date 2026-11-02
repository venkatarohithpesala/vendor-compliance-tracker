import { Company, User } from "../models/index.js";

// Create a new company (only super_admin)
export const createCompany = async (req, res) => {
  const { name, website, status = "active" } = req.body;

  try {
    // Authorization check: only super_admin can create companies
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can create companies.",
        });
    }

    // Validation: name is required
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({
          message: "Company name is required and must be a non-empty string.",
        });
    }

    // Check for uniqueness (case-insensitive)
    const existingCompany = await Company.findOne({
      where: { name: name.trim() },
    });
    if (existingCompany) {
      return res
        .status(409)
        .json({ message: "A company with this name already exists." });
    }

    // Optional: validate website if provided (basic URL check)
    if (website && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(website)) {
      return res
        .status(400)
        .json({
          message: "Website must be a valid URL starting with http or https.",
        });
    }

    // Validate status
    if (!["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'active' or 'inactive'." });
    }

    // Create the company
    const company = await Company.create({
      name: name.trim(),
      website: website ? website.trim() : null,
      status,
      createdBy: req.user.email,
    });

    // Return success response (exclude sensitive fields if any)
    res.status(201).json({
      message: "Company created successfully.",
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        status: company.status,
        createdByEmail: req.user.email,
        createdAt: company.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating company:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all companies (only super_admin)
export const getCompanies = async (req, res) => {
  try {
    // Authorization check: only super_admin can view companies
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can view companies.",
        });
    }

    // Fetch all companies
    const companies = await Company.findAll({
      order: [["createdAt", "DESC"]],
    });

    // Fetch creator emails for each company (createdBy is already email)
    const companiesWithEmails = await Promise.all(
      companies.map(async (company) => {
        return {
          id: company.id,
          name: company.name,
          website: company.website,
          status: company.status,
          createdByEmail: company.createdBy,
          updatedByEmail: company.updatedBy,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        };
      })
    );

    res.json({
      companies: companiesWithEmails,
      total: companiesWithEmails.length,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update company status (only super_admin)
export const updateCompanyStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Authorization check: only super_admin can update company status
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can update company status.",
        });
    }

    // Validation: status is required and must be valid
    if (!status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'active' or 'inactive'." });
    }

    // Find the company
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Update the status
    company.status = status;
    company.updatedBy = req.user.email;  // Track who updated the company
    await company.save();

    // Return success response
    res.json({
      message: "Company status updated successfully.",
      company: {
        id: company.id,
        name: company.name,
        website: company.website,
        status: company.status,
        createdByEmail: company.createdBy,
        updatedByEmail: company.updatedBy,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating company status:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Assign admin to company (only super_admin)
export const assignAdminToCompany = async (req, res) => {
  const { id } = req.params; // company id
  const { adminId } = req.body;

  try {
    // Authorization check: only super_admin can assign admins
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can assign admins to companies.",
        });
    }

    // Validation: adminId is required
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required." });
    }

    // Find the company
    const company = await Company.findByPk(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Find the admin user
    const admin = await User.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // Check if user is an admin
    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User must be an admin to be assigned to a company." });
    }

    // Assign the admin to the company
    admin.companyId = id;
    await admin.save();

    // Return success response
    res.json({
      message: "Admin assigned to company successfully.",
      assignment: {
        companyId: company.id,
        companyName: company.name,
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
      },
    });
  } catch (error) {
    console.error("Error assigning admin to company:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get available admins (not assigned to any company)
export const getAvailableAdmins = async (req, res) => {
  try {
    // Authorization check: only super_admin can view available admins
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can view available admins.",
        });
    }

    // Get admins not assigned to any company
    const availableAdmins = await User.findAll({
      where: {
        role: "admin",
        companyId: null, // Not assigned to any company
      },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });

    res.json({
      admins: availableAdmins,
      total: availableAdmins.length,
    });
  } catch (error) {
    console.error("Error fetching available admins:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
