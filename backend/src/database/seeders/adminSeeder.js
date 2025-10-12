import bcrypt from 'bcryptjs';
import User from '../../models/User.js';

export async function seedAdminUser() {
    try {
        // Check if admin already exists
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
                name: 'System Administrator',
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            });

        } 
    } catch (error) {
        console.error('Error seeding admin user:', error);
        throw error;
    }
}