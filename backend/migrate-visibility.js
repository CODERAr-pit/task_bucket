import mongoose from 'mongoose';
import { Task } from './models/Task.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskbucket', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function migrateExistingTasks() {
    try {
        console.log('🔄 Starting migration to add visibility field to existing tasks...');
        
        // Find all tasks without visibility field
        const tasksWithoutVisibility = await Task.find({
            visibility: { $exists: false }
        });
        
        console.log(`Found ${tasksWithoutVisibility.length} tasks without visibility field`);
        
        if (tasksWithoutVisibility.length === 0) {
            console.log('✅ All tasks already have visibility field');
            process.exit(0);
        }
        
        // Update all tasks without visibility to be 'public'
        const result = await Task.updateMany(
            { visibility: { $exists: false } },
            { $set: { visibility: 'public' } }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} tasks to have visibility: 'public'`);
        
        // Verify the migration
        const allTasks = await Task.find({}).select('title visibility').lean();
        console.log('\n📋 All tasks after migration:');
        allTasks.forEach((task, index) => {
            console.log(`${index + 1}. "${task.title}" - Visibility: ${task.visibility}`);
        });
        
        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}

migrateExistingTasks();
