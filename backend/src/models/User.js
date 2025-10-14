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
        unique: true,
    },
    password :{
        type: DataTypes.STRING,
        allowNull:false,
    },
    role : {
        type: DataTypes.ENUM("super_admin", "admin", "manager", "vendor"),
        defaultValue : "vendor",
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: true,  // super_admin won't have a company
        references: {
            model: 'Companies',  // We'll create this table
            key: 'id'
        }
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,  // Will be null for first super_admin
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

export default User;