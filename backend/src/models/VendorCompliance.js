import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const VendorCompliance = sequelize.define('VendorCompliance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vendorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Vendors',
      key: 'id',
    },
  },
  requirementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ComplianceRequirements',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('compliant', 'non-compliant', 'pending', 'expired', 'not-applicable'),
    defaultValue: 'pending',
    allowNull: false,
  },
  complianceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when compliance was achieved',
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date when compliance expires',
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Next compliance check/review date',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  documentUrls: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of document URLs for compliance evidence',
  },
  assignedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User who assigned this requirement',
  },
  reviewedBy: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'User who last reviewed this compliance',
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  updatedBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'VendorCompliance',
  timestamps: true,
});

export default VendorCompliance;