import {DataTypes} from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name : {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email : {
        type: DataTypes.STRING,
        allowNull: false,
        // Removed unique: true to prevent duplicate index creation
    },
    password :{
        type: DataTypes.STRING,
        allowNull:false,
    },
    role : {
        type: DataTypes.ENUM("super_admin", "admin", "staff", "vendor"),
        defaultValue : "vendor",
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // super_admin won't have a company
        references: {
            model: 'Companies', 
            key: 'id'
        }
    },
    createdBy: {
        type: DataTypes.STRING,  // Store email 
        allowNull: true,  // Will be null for first super_admin
    },
    updatedBy: {
        type: DataTypes.STRING,  // Store email
        allowNull: true,
    },
    inviteToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'invite_token'
    },
    inviteExpires: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'invite_expires'
    },
    inviteStatus: {
        type: DataTypes.ENUM('pending', 'accepted', 'expired'),
        defaultValue: null,
        allowNull: true,
        field: 'invite_status'
    },
    passwordResetRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'password_reset_required'
    }
}, {
  tableName: 'Users',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ],
});

export default User;