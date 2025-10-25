import User from './User.js';
import Company from './Company.js';
import Email from './Email.js';

// Define relationships
const initializeModels = () => {
    // Company has many Users
    Company.hasMany(User, {
        foreignKey: 'companyId'
    });

    // User belongs to Company
    User.belongsTo(Company, {
        foreignKey: 'companyId'
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

export { User, Company, Email, initializeModels };