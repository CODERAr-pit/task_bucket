import mongoose from 'mongoose';
import { Task } from './models/Task.js';
import { addVisibilityFilter } from './utils/visibility.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskbucket', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function testVisibility() {
    try {
        console.log('🔍 Testing visibility implementation...');
        
        // 1. Check all tasks and their visibility status
        console.log('\n📋 All tasks in database:');
        const allTasks = await Task.find({}).select('title visibility taskMaker assignedTo').lean();
        allTasks.forEach((task, index) => {
            console.log(`${index + 1}. "${task.title}" - Visibility: ${task.visibility || 'UNDEFINED'} - Maker: ${task.taskMaker} - Assigned: ${JSON.stringify(task.assignedTo)}`);
        });
        
        // 2. Test the visibility filter with a mock user ID
        const mockUserId = allTasks.length > 0 ? allTasks[0].taskMaker : new mongoose.Types.ObjectId();
        console.log(`\n🔒 Testing visibility filter for user: ${mockUserId}`);
        
        let query = Task.find({});
        query = addVisibilityFilter(query, mockUserId);
        
        const filteredTasks = await query.select('title visibility taskMaker assignedTo').lean();
        console.log(`Found ${filteredTasks.length} visible tasks for user ${mockUserId}:`);
        filteredTasks.forEach((task, index) => {
            console.log(`${index + 1}. "${task.title}" - Visibility: ${task.visibility || 'UNDEFINED'}`);
        });
        
        // 3. Create a test private task
        console.log('\n🔐 Creating a test private task...');
        const testTask = new Task({
            title: 'Test Private Task',
            description: 'This is a test private task',
            taskMaker: mockUserId,
            assignedTo: [mockUserId],
            domain: 'General',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            visibility: 'private'
        });
        
        await testTask.save();
        console.log('✅ Test private task created successfully');
        
        // 4. Test filter again
        console.log('\n🔍 Testing filter again after creating private task...');
        query = Task.find({});
        query = addVisibilityFilter(query, mockUserId);
        const finalFilteredTasks = await query.select('title visibility taskMaker assignedTo').lean();
        console.log(`Found ${finalFilteredTasks.length} visible tasks for user ${mockUserId}:`);
        finalFilteredTasks.forEach((task, index) => {
            console.log(`${index + 1}. "${task.title}" - Visibility: ${task.visibility || 'UNDEFINED'}`);
        });
        
        // 5. Test with different user (should not see private task)
        const differentUserId = new mongoose.Types.ObjectId();
        console.log(`\n👤 Testing with different user: ${differentUserId}`);
        query = Task.find({});
        query = addVisibilityFilter(query, differentUserId);
        const differentUserTasks = await query.select('title visibility taskMaker assignedTo').lean();
        console.log(`Found ${differentUserTasks.length} visible tasks for user ${differentUserId}:`);
        differentUserTasks.forEach((task, index) => {
            console.log(`${index + 1}. "${task.title}" - Visibility: ${task.visibility || 'UNDEFINED'}`);
        });
        
        console.log('\n✅ Test completed!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error testing visibility:', error);
        process.exit(1);
    }
}

testVisibility();
