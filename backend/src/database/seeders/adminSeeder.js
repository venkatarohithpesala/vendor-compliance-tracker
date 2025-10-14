import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

export async function seedAdminUser() {
    try {
        // Get the super admin to set as creator
        const superAdmin = await User.findOne({
            where: { role: 'super_admin' }
        });

        if (!superAdmin) {
            console.log('Super admin must exist before creating admin');
            return;
        }

        // Check if test admin already exists
        const existingAdmin = await User.findOne({
            where: { email: process.env.ADMIN_EMAIL }
        });

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD,
                salt
            );

            await User.create({
                name: 'Company Administrator',
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin',
                createdById: superAdmin.id
            });

        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
        throw error;
    }
}