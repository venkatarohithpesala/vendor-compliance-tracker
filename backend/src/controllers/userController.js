import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Op } from "sequelize";
import { User, Company, Email } from "../models/index.js";
import emailQueue from "../config/emailQueue.js";

// Create a new admin user (only super_admin) - INVITE BASED
export const createAdmin = async (req, res) => {
  const { name, email } = req.body;

  try {
    // Authorization check: only super_admin can create admin users
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can create admin users.",
        });
    }

    // Validation: required fields
    if (!name || !email) {
      return res
        .status(400)
        .json({
          message: "Name and email are required.",
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address." });
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

    // Create admin user with temporary password and invite status
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedTempPassword,
      role: "admin",
      inviteToken,
      inviteExpires,
      inviteStatus: 'pending',
      passwordResetRequired: true,
      createdBy: req.user.email,  // Store email instead of user ID
    });

    // Create email record for invite
    const emailRecord = await Email.create({
      toAddress: admin.email,
      subject: 'Welcome to VenTrack - Admin Invitation',
      template: 'admin-invite',
      context: {
        adminName: admin.name,
        inviterName: req.user.name,
        inviterEmail: req.user.email,
        tempPassword: tempPassword,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${inviteToken}`,
        expiresAt: inviteExpires.toLocaleString(),
      }
    });

    // Queue the email
    await emailQueue.add({
      emailId: emailRecord.id,
      to: admin.email,
      subject: 'Welcome to VenTrack - Admin Invitation',
      template: 'admin-invite',
      context: {
        adminName: admin.name,
        inviterName: req.user.name,
        inviterEmail: req.user.email,
        tempPassword: tempPassword,
        inviteUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite/${inviteToken}`,
        expiresAt: inviteExpires.toLocaleString(),
      }
    });

    // Return success response
    res.status(201).json({
      message: "Admin invitation sent successfully. The user will receive an email with setup instructions.",
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        inviteStatus: admin.inviteStatus,
        inviteExpires: admin.inviteExpires,
      },
    });
  } catch (error) {
    console.error("Error creating admin invitation:", error);
    res
      .status(500)
      .json({ message: "Internal server error. Please try again." });
  }
};

// Get all admin users (only super_admin)
export const getAdmins = async (req, res) => {
  try {
    // Authorization check: only super_admin can view admin users
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can view admin users.",
        });
    }

    // Fetch all admin users with company info
    const admins = await User.findAll({
      where: { role: "admin" },
      attributes: ["id", "name", "email", "companyId", "createdAt", "updatedAt", "createdBy", "updatedBy"],
      order: [["createdAt", "DESC"]],
    });

    // Get company names for admins with companyId
    const adminsWithCompanyInfo = await Promise.all(
      admins.map(async (admin) => {
        let companyName = null;
        if (admin.companyId) {
          const company = await Company.findByPk(admin.companyId);
          companyName = company ? company.name : "Unknown Company";
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          companyId: admin.companyId,
          companyName,
          createdBy: admin.createdBy,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
          updatedBy: admin.updatedBy,
        };
      })
    );

    res.json({
      admins: adminsWithCompanyInfo,
      total: adminsWithCompanyInfo.length,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get single admin user (only super_admin)
export const getAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Authorization check: only super_admin can view admin users
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can view admin users.",
        });
    }

    // Find the admin user
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // Check if it's actually an admin
    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin." });
    }

    // Get admin with company info
    const adminWithCompany = await User.findByPk(id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name'],
        required: false
      }]
    });

    res.json({
      admin: {
        id: adminWithCompany.id,
        name: adminWithCompany.name,
        email: adminWithCompany.email,
        role: adminWithCompany.role,
        companyId: adminWithCompany.companyId,
        companyName: adminWithCompany.company ? adminWithCompany.company.name : null,
        createdAt: adminWithCompany.createdAt,
        updatedAt: adminWithCompany.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching admin user:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update admin user (only super_admin)
export const updateAdmin = async (req, res) => {
  const { id } = req.params;
  const { name, email, companyId } = req.body;

  try {
    // Authorization check: only super_admin can update admin users
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can update admin users.",
        });
    }

    // Find the admin user
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // Check if it's actually an admin
    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin." });
    }

    // Validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return res.status(400).json({ message: "Name must be a non-empty string." });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }

      // Check if email is already taken by another user
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase(), id: { [Op.ne]: id } }
      });
      if (existingUser) {
        return res.status(409).json({ message: "A user with this email already exists." });
      }
    }

    // Validate companyId if provided
    if (companyId !== undefined) {
      if (companyId !== null) {
        // Check if company exists
        const company = await Company.findByPk(companyId);
        if (!company) {
          return res.status(404).json({ message: "Company not found." });
        }
      }
      // If companyId is null, we're unassigning the admin
    }

    // Update user
    if (name) admin.name = name.trim();
    if (email) admin.email = email.toLowerCase().trim();
    if (companyId !== undefined) admin.companyId = companyId;
    admin.updatedBy = req.user.email;

    await admin.save();

    // Get updated user with company info if assigned
    const updatedAdmin = await User.findByPk(id, {
      include: [{
        model: Company,
        as: 'company',
        attributes: ['id', 'name'],
        required: false
      }]
    });

    // Return updated user
    res.json({
      message: "Admin user updated successfully.",
      user: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        companyId: updatedAdmin.companyId,
        companyName: updatedAdmin.company ? updatedAdmin.company.name : null,
        updatedAt: updatedAdmin.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating admin user:", error);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};

// Delete admin user (only super_admin)
export const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    // Authorization check: only super_admin can delete admin users
    if (req.user.role !== "super_admin") {
      return res
        .status(403)
        .json({
          message: "Access denied. Only super_admin can delete admin users.",
        });
    }

    // Find the admin user
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // Check if it's actually an admin
    if (admin.role !== "admin") {
      return res.status(400).json({ message: "User is not an admin." });
    }

    // Check if admin is assigned to a company
    if (admin.companyId) {
      return res.status(400).json({
        message: "Cannot delete admin user assigned to a company. Unassign first.",
      });
    }

    // Delete the user
    await admin.destroy();

    res.json({ message: "Admin user deleted successfully." });
  } catch (error) {
    console.error("Error deleting admin user:", error);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};

// Accept admin invitation and set password
export const acceptInvite = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    // Find user by invite token
    const user = await User.findOne({
      where: {
        inviteToken: token,
        inviteStatus: 'pending'
      }
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired invitation token."
      });
    }

    // Check if token has expired
    if (user.inviteExpires < new Date()) {
      await user.update({ inviteStatus: 'expired' });
      return res.status(400).json({
        message: "Invitation has expired. Please contact your administrator for a new invitation."
      });
    }

    // Validate password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long."
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user with password and mark invite as accepted
    await user.update({
      password: hashedPassword,
      inviteToken: null,
      inviteExpires: null,
      inviteStatus: 'accepted',
      passwordResetRequired: false
    });

    res.json({
      message: "Account setup completed successfully! You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ message: "Internal server error. Please try again." });
  }
};

// Validate invite token (for frontend to check if token is valid)
export const validateInviteToken = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      where: {
        inviteToken: token,
        inviteStatus: 'pending'
      }
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: "Invalid invitation token."
      });
    }

    if (user.inviteExpires < new Date()) {
      await user.update({ inviteStatus: 'expired' });
      return res.status(400).json({
        valid: false,
        message: "Invitation has expired."
      });
    }

    res.json({
      valid: true,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Error validating invite token:", error);
    res.status(500).json({
      valid: false,
      message: "Internal server error."
    });
  }
};