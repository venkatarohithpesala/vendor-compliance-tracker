import sequelize from '../config/db.js';
import { initializeModels } from '../models/index.js';
import { seedSuperAdmin } from './seeders/superAdminSeeder.js';
import { seedAdminUser } from './seeders/adminSeeder.js';

export async function initializeDatabase() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('Database connection established successfully');

        // Initialize model relationships (needed for seeders)
        initializeModels();

        // Note: Schema is now managed by migrations
        // Run migrations manually with: npx sequelize-cli db:migrate

        // Run seeders in order
        await seedSuperAdmin();  // First create super admin
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        throw error;
    }
}