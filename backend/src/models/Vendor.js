import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Vendor = sequelize.define('Vendor', {
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
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
    allowNull: false,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id',
    },
  },
  createdBy: {
    type: DataTypes.STRING,  // Store email instead of user ID
    allowNull: false,
  },
  updatedBy: {
    type: DataTypes.STRING,  // Store email instead of user ID
    allowNull: true,
  },
}, {
  tableName: 'Vendors',
  timestamps: true,
  indexes: [
    {
      fields: ['companyId'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['createdBy'],
    },
  ],
});

export default Vendor;