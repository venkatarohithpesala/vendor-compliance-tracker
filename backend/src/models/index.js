import sequelize from '../config/db.js';
import User from './User.js';
import Company from './Company.js';
import Email from './Email.js';
import Vendor from './Vendor.js';

// Define relationships
const initializeModels = () => {
    // Company has many Users
    Company.hasMany(User, {
        foreignKey: 'companyId'
    });

    // User belongs to Company
    User.belongsTo(Company, {
        foreignKey: 'companyId',
        as: 'company'
    });

    // Company has many Vendors
    Company.hasMany(Vendor, {
        foreignKey: 'companyId'
    });

    // Vendor belongs to Company
    Vendor.belongsTo(Company, {
        foreignKey: 'companyId',
        as: 'company'
    });

    // Vendor belongs to User (createdBy)
    Vendor.belongsTo(User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });

    // User has many Vendors (created)
    User.hasMany(Vendor, {
        foreignKey: 'createdBy',
        as: 'createdVendors'
    });

    // Vendor belongs to User (updatedBy)
    Vendor.belongsTo(User, {
        foreignKey: 'updatedBy',
        as: 'updater'
    });

    // User has many Vendors (updated)
    User.hasMany(Vendor, {
        foreignKey: 'updatedBy',
        as: 'updatedVendors'
    });

    // User self-referencing relationships
    User.belongsTo(User, {
        foreignKey: 'createdBy',
        as: 'creator'
    });

    User.hasMany(User, {
        foreignKey: 'createdBy',
        as: 'createdUsers'
    });

    User.belongsTo(User, {
        foreignKey: 'updatedBy',
        as: 'updater'
    });

    User.hasMany(User, {
        foreignKey: 'updatedBy',
        as: 'updatedUsers'
    });
};

export { User, Company, Email, Vendor, initializeModels };