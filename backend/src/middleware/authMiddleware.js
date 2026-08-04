import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../utils/redisUtils.js";
import { User } from "../models/index.js";

export const protect = async (req, res, next) => {
  // Get token from cookie
  const token = req.cookies?.token;
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    // Check if token is blacklisted
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token has been revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data from database to ensure we have latest companyId
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role", "companyId"],
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // If user is a vendor, include vendorId
    if (user.role === "vendor") {
      const { Vendor } = await import("../models/index.js");
      const vendor = await Vendor.findOne({
        where: { email: user.email },
        attributes: ["id"],
      });
      if (vendor) {
        user.vendorId = vendor.id;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to check if user is admin or super_admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }
  next();
};

// Middleware to check if user is super_admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({ message: "Access denied. Super admin privileges required." });
  }
  next();
};
