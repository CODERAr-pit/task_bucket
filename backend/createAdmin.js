import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get admin emails from environment variable
        const adminEmailsEnv = process.env.ADMIN_EMAILS;
        if (!adminEmailsEnv) {
            console.error('ADMIN_EMAILS not found in environment variables');
            console.log('Please add ADMIN_EMAILS to your .env file');
            process.exit(1);
        }

        const adminEmails = adminEmailsEnv.split(',');
        console.log(`Creating/updating admin users for ${adminEmails.length} email addresses...`);
        
        for (let i = 0; i < adminEmails.length; i++) {
            const adminEmail = adminEmails[i].trim();
            
            if (!adminEmail) {
                console.log(`Skipping empty email at position ${i + 1}`);
                continue;
            }

            // Check if admin already exists
            const existingUser = await User.findOne({ email: adminEmail });
            
            if (existingUser) {
                // Update existing user to admin
                const wasAlreadyAdmin = existingUser.isAdmin;
                const wasAlreadyActive = existingUser.status === 'active';
                
                await User.findByIdAndUpdate(existingUser._id, {
                    isAdmin: true,
                    status: 'active',
                    verified: true
                });
                
                if (wasAlreadyAdmin && wasAlreadyActive) {
                    console.log(`✓ ${adminEmail} - Already an admin (no changes needed)`);
                } else {
                    console.log(`✓ ${adminEmail} - Updated existing user to admin status`);
                }
            } else {
                // Create new admin user
                const adminUser = new User({
                    name: `Admin ${adminEmail.split('@')[0]}`,
                    email: adminEmail,
                    password: 'admin123456', 
                    role: '4th Year',
                    domain: 'General',
                    status: 'active',
                    isAdmin: true,
                    verified: true
                });
                
                await adminUser.save();
                console.log(`✓ ${adminEmail} - New admin user created`);
                console.log(`  Default password: admin123456 (PLEASE CHANGE THIS!)`);
            }
        }

        // Display summary
        console.log('\n--- ADMIN SETUP SUMMARY ---');
        const totalAdmins = await User.countDocuments({ isAdmin: true });
        const activeAdmins = await User.countDocuments({ isAdmin: true, status: 'active' });
        
        console.log(`Total admin users: ${totalAdmins}`);
        console.log(`Active admin users: ${activeAdmins}`);
        
        // List all current admins
        const allAdmins = await User.find({ isAdmin: true }).select('name email status');
        console.log('\nCurrent admin users:');
        allAdmins.forEach((admin, index) => {
            const statusIcon = admin.status === 'active' ? '✓' : '⚠';
            console.log(`  ${index + 1}. ${statusIcon} ${admin.name} (${admin.email}) - ${admin.status}`);
        });

        console.log('\n--- IMPORTANT NOTES ---');
        console.log('1. Please ask admins to change their passwords after first login');
        console.log('2. Admins can access the admin panel at: /admin');
        console.log('3. Admin emails for notifications are configured from ADMIN_EMAILS in .env');
        console.log('4. Default password is "admin123456" - change it immediately!');

        console.log('\nAdmin creation completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('Error creating admin users:', error);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\nDatabase connection failed. Please check:');
            console.log('1. Your internet connection');
            console.log('2. MONGODB_URI in your .env file');
        } else if (error.name === 'ValidationError') {
            console.log('\nValidation error. Please check the data format.');
        }
        
        process.exit(1);
    }
};

// Run the script
createAdminUsers();