import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateDomains = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all users who don't have the domains field set
        const usersToUpdate = await User.find({
            $or: [
                { domains: { $exists: false } },
                { domains: { $size: 0 } }
            ]
        });

        console.log(`Found ${usersToUpdate.length} users to migrate...`);

        let updatedCount = 0;
        
        for (const user of usersToUpdate) {
            // If user has a domain field, use it to populate domains array
            if (user.domain) {
                user.domains = [user.domain];
                await user.save();
                console.log(`✓ Migrated user: ${user.email} - Domain: ${user.domain}`);
                updatedCount++;
            } else {
                // If no domain, set to General
                user.domains = ['General'];
                user.domain = 'General';
                await user.save();
                console.log(`✓ Migrated user: ${user.email} - Set to General domain`);
                updatedCount++;
            }
        }

        console.log(`\n--- MIGRATION COMPLETE ---`);
        console.log(`Successfully migrated ${updatedCount} users`);
        
        // Display summary
        const totalUsers = await User.countDocuments();
        console.log(`Total users in database: ${totalUsers}`);
        
        // Show domain distribution
        const domainCounts = await User.aggregate([
            { $unwind: '$domains' },
            { $group: { _id: '$domains', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\nDomain distribution:');
        domainCounts.forEach(domain => {
            console.log(`  ${domain._id}: ${domain.count} users`);
        });

    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
};

migrateDomains();
