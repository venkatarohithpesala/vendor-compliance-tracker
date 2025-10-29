import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ComplianceRequirement = sequelize.define('ComplianceRequirement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'ComplianceCategories',
      key: 'id',
    },
  },
  frequency: {
    type: DataTypes.ENUM('one-time', 'annual', 'semi-annual', 'quarterly', 'monthly'),
    allowNull: false,
    defaultValue: 'annual',
  },
  defaultDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  renewalPeriodMonths: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Number of months until renewal is required',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
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
  tableName: 'ComplianceRequirements',
  timestamps: true,
});

export default ComplianceRequirement;