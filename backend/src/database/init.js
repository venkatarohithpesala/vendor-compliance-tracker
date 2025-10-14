import sequelize from '../config/db.js';
import { initializeModels } from '../models/index.js';
import { seedSuperAdmin } from './seeders/superAdminSeeder.js';
import { seedAdminUser } from './seeders/adminSeeder.js';

export async function initializeDatabase() {
    try {
        // Test database connection
        await sequelize.authenticate();

        // Initialize model relationships
        initializeModels();

        // Sync all models with database
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized');

        // Run seeders in order
        await seedSuperAdmin();  // First create super admin
        await seedAdminUser();   // Then create regular admin
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}