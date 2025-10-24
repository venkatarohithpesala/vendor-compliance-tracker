import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

export const seedSuperAdmin = async () => {
    try {
        // Check if super admin exists
        const existingSuperAdmin = await User.findOne({
            where: { role: 'super_admin' }
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await bcrypt.hash('admin', 10);
            
            const superAdmin = await User.create({
                name: 'System Administrator',
                email: 'superadmin@gmail.com',
                password: hashedPassword,
                role: 'super_admin',
                createdAt: new Date(),
                updatedAt: new Date()
                // createdBy and updatedBy will be null for super admin as they are the first user
            });

        }
    } catch (error) {
        console.error('Error seeding super admin:', error);
    }
};