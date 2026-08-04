import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AccessRequest = sequelize.define("AccessRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: true },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { isEmail: true },
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true },
  },
  status: {
    type: DataTypes.ENUM("pending", "reviewed", "approved", "rejected"),
    defaultValue: "pending",
    allowNull: false,
  },
  reviewedBy: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: "reviewed_by",
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "reviewed_at",
  },
}, {
  tableName: "AccessRequests",
  timestamps: true,
});

export default AccessRequest;
