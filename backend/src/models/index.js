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
};

export { User, Company, Email, initializeModels };