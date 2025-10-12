import sequelize from '../config/db.js';
import { seedAdminUser } from './seeders/adminSeeder.js';

export async function initializeDatabase() {
    try {
        // Test database connection
        await sequelize.authenticate();

        // Sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized');

        // Run seeders
        await seedAdminUser();
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}