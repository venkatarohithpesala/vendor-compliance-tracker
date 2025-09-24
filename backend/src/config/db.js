import {Sequelize} from "sequelize"; // Import Sequlizer
import dotenv from "dotenv";

// Load Environment Variables from .env
dotenv.config();

//create Sequlize instance
const sequelize = new Sequelize(
    process.env.DB_NAME, // Database name
    process.env.DB_USER, // Username
    process.env.DB_PASS, // Password
    {
        host: process.env.DB_HOST, // Host, e.g., localhost
        dialect: "mysql",     // Database type
        logging: false,       // Disable SQL logging
    }
);

export default sequelize;