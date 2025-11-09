import User from "./User.js";
import Company from "./Company.js";
import Email from "./Email.js";
import Vendor from "./Vendor.js";
import ComplianceCategory from "./ComplianceCategory.js";
import ComplianceRequirement from "./ComplianceRequirement.js";
import VendorCompliance from "./VendorCompliance.js";
import Document from "./Document.js";

// Define relationships
const initializeModels = () => {
  // Company associations - updatedBy now stores emails directly
  // Basic business relationships still needed
  Company.hasMany(User, { foreignKey: "companyId" });
  User.belongsTo(Company, { foreignKey: "companyId", as: "company" });

  // Company has many Vendors
  Company.hasMany(Vendor, {
    foreignKey: "companyId",
  });

  // Vendor belongs to Company
  Vendor.belongsTo(Company, {
    foreignKey: "companyId",
    as: "company",
  });

  // Vendor associations - createdBy/updatedBy now store emails directly
  // No foreign key relationships needed since we're storing emails
  // User.hasMany(Vendor, { foreignKey: 'createdBy', as: 'createdVendors' });
  // Vendor.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  // User.hasMany(Vendor, { foreignKey: 'updatedBy', as: 'updatedVendors' });
  // Vendor.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

  // User self-referencing relationships removed since createdBy/updatedBy now store emails instead of IDs
  // User.belongsTo(User, {
  //     foreignKey: 'createdBy',
  //     as: 'creator'
  // });

  // User.hasMany(User, {
  //     foreignKey: 'createdBy',
  //     as: 'createdUsers'
  // });

  // User.belongsTo(User, {
  //     foreignKey: 'updatedBy',
  //     as: 'updater'
  // });

  // User.hasMany(User, {
  //     foreignKey: 'updatedBy',
  //     as: 'updatedUsers'
  // });

  // Compliance Category associations
  ComplianceCategory.hasMany(ComplianceRequirement, {
    foreignKey: "categoryId",
    as: "requirements",
  });

  // Compliance Requirement associations
  ComplianceRequirement.belongsTo(ComplianceCategory, {
    foreignKey: "categoryId",
    as: "category",
  });

  ComplianceRequirement.hasMany(VendorCompliance, {
    foreignKey: "requirementId",
    as: "vendorCompliances",
  });

  // Vendor Compliance associations
  VendorCompliance.belongsTo(Vendor, {
    foreignKey: "vendorId",
    as: "vendor",
  });

  VendorCompliance.belongsTo(ComplianceRequirement, {
    foreignKey: "requirementId",
    as: "requirement",
  });

  // Vendor has many compliance records
  Vendor.hasMany(VendorCompliance, {
    foreignKey: "vendorId",
    as: "complianceRecords",
  });

  // Document associations
  Document.belongsTo(VendorCompliance, {
    foreignKey: "complianceId",
    as: "compliance",
  });

  // VendorCompliance has many documents
  VendorCompliance.hasMany(Document, {
    foreignKey: "complianceId",
    as: "documents",
  });
};

export {
  User,
  Company,
  Email,
  Vendor,
  ComplianceCategory,
  ComplianceRequirement,
  VendorCompliance,
  Document,
  initializeModels,
};
