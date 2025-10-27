import { Vendor, Company, User, Email } from "../models/index.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import emailQueue from "../config/emailQueue.js";

// Create a new vendor
export const createVendor = async (req, res) => {
  const { name, email, phone, address, category, companyId } = req.body;

  try {
    // Validation: name is required
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res
        .status(400)
        .json({
          message: "Vendor name is required and must be a non-empty string.",
        });
    }

    // Validation: email is required for vendor login
    if (!email || typeof email !== "string" || email.trim().length === 0) {
      return res
        .status(400)
        .json({
          message: "Vendor email is required for account creation.",
        });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Email must be valid." });
    }

    // For admin users, use their assigned company
    let vendorCompanyId = companyId;
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res
          .status(403)
          .json({
            message: "Access denied. Admin must be assigned to a company.",
          });
      }
      vendorCompanyId = req.user.companyId;
    } else if (req.user.role === "super_admin") {
      // Super admin must provide companyId
      if (!companyId) {
        return res
          .status(400)
          .json({ message: "Company ID is required for super_admin." });
      }
    } else {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    // Verify company exists and is active
    const company = await Company.findByPk(vendorCompanyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    if (company.status !== "active") {
      return res.status(400).json({ message: "Cannot create vendor for inactive company." });
    }

    // Check for existing user with this email
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "A user with this email already exists." });
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(12).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedTempPassword = await bcrypt.hash(tempPassword, salt);

    // Generate secure invite token
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create vendor user account first
    const vendorUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedTempPassword,
      role: "vendor",
      companyId: vendorCompanyId,
      inviteToken,
      inviteExpires,
      inviteStatus: 'pending',
      passwordResetRequired: true,
      createdBy: req.user.id,
    });

    // Create the vendor record
    const vendor = await Vendor.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null,
      address: address ? address.trim() : null,
      category: category ? category.trim() : null,
      companyId: vendorCompanyId,
      createdBy: req.user.id,
    });

    // Create email record for invite
    const emailRecord = await Email.create({
      toAddress: vendorUser.email,
      subject: 'Welcome to VenTrack - Vendor Invitation',
      template: 'vendor-invite',
      context: {
        vendorName: vendorUser.name,
        inviterName: req.user.name,
        inviterEmail: req.user.email,
        companyName: company.name,
        tempPassword: tempPassword,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${inviteToken}`,
        expiresAt: inviteExpires.toLocaleString(),
      }
    });

    // Queue the email
    await emailQueue.add({
      emailId: emailRecord.id,
      to: vendorUser.email,
      subject: 'Welcome to VenTrack - Vendor Invitation',
      template: 'vendor-invite',
      context: {
        vendorName: vendorUser.name,
        inviterName: req.user.name,
        inviterEmail: req.user.email,
        companyName: company.name,
        tempPassword: tempPassword,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${inviteToken}`,
        expiresAt: inviteExpires.toLocaleString(),
      }
    });

    // Fetch the created vendor with associations
    const vendorWithAssociations = await Vendor.findByPk(vendor.id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    // Return success response
    res.status(201).json({
      message: "Vendor created successfully. An invitation email has been sent to the vendor.",
      vendor: {
        id: vendorWithAssociations.id,
        name: vendorWithAssociations.name,
        email: vendorWithAssociations.email,
        phone: vendorWithAssociations.phone,
        address: vendorWithAssociations.address,
        category: vendorWithAssociations.category,
        status: vendorWithAssociations.status,
        company: vendorWithAssociations.company,
        creator: vendorWithAssociations.creator,
        createdAt: vendorWithAssociations.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all vendors (filtered by company for admins)
export const getVendors = async (req, res) => {
  try {
    let whereClause = {};

    // Filter by company for admin users
    if (req.user.role === "admin") {
      if (!req.user.companyId) {
        return res
          .status(403)
          .json({
            message: "Access denied. Admin must be assigned to a company.",
          });
      }
      whereClause.companyId = req.user.companyId;
    }
    // Super admin can see all vendors

    // Fetch vendors with associations
    const vendors = await Vendor.findAll({
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      vendors: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        category: vendor.category,
        status: vendor.status,
        company: vendor.company,
        creator: vendor.creator,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      })),
      total: vendors.length,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, category } = req.body;

  try {
    // Find the vendor
    const vendor = await Vendor.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check permissions
    if (req.user.role === "admin") {
      if (!req.user.companyId || vendor.companyId !== req.user.companyId) {
        return res
          .status(403)
          .json({ message: "Access denied. Can only update vendors from your company." });
      }
    }
    // Super admin can update any vendor

    // Validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return res.status(400).json({ message: "Vendor name must be a non-empty string." });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Email must be valid." });
    }

    // Update the vendor
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (category !== undefined) updateData.category = category ? category.trim() : null;

    updateData.updatedBy = req.user.id;

    await vendor.update(updateData);

    // Fetch updated vendor with associations
    const updatedVendor = await Vendor.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: "Vendor updated successfully.",
      vendor: {
        id: updatedVendor.id,
        name: updatedVendor.name,
        email: updatedVendor.email,
        phone: updatedVendor.phone,
        address: updatedVendor.address,
        category: updatedVendor.category,
        status: updatedVendor.status,
        company: updatedVendor.company,
        creator: updatedVendor.creator,
        createdAt: updatedVendor.createdAt,
        updatedAt: updatedVendor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Update vendor status
export const updateVendorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Validation: status is required and must be valid
    if (!status || !["active", "inactive"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be 'active' or 'inactive'." });
    }

    // Find the vendor
    const vendor = await Vendor.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check permissions
    if (req.user.role === "admin") {
      if (!req.user.companyId || vendor.companyId !== req.user.companyId) {
        return res
          .status(403)
          .json({ message: "Access denied. Can only update vendors from your company." });
      }
    }
    // Super admin can update any vendor

    // Update the status
    vendor.status = status;
    vendor.updatedBy = req.user.id;
    await vendor.save();

    // Fetch updated vendor with associations
    const updatedVendor = await Vendor.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: "Vendor status updated successfully.",
      vendor: {
        id: updatedVendor.id,
        name: updatedVendor.name,
        email: updatedVendor.email,
        phone: updatedVendor.phone,
        address: updatedVendor.address,
        category: updatedVendor.category,
        status: updatedVendor.status,
        company: updatedVendor.company,
        creator: updatedVendor.creator,
        createdAt: updatedVendor.createdAt,
        updatedAt: updatedVendor.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating vendor status:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the vendor
    const vendor = await Vendor.findByPk(id, {
      include: [
        {
          model: Company,
          as: 'company'
        }
      ]
    });

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check permissions
    if (req.user.role === "admin") {
      if (!req.user.companyId || vendor.companyId !== req.user.companyId) {
        return res
          .status(403)
          .json({ message: "Access denied. Can only delete vendors from your company." });
      }
    }
    // Super admin can delete any vendor

    // Delete the vendor
    await vendor.destroy();

    res.json({
      message: "Vendor deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};