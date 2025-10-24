import Company from "../models/Company.js";

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
          createdByEmail: company.createdBy || "Unknown",
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
