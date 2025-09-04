import cron from 'node-cron';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { 
    sendDeadlineReminder5Days, 
    sendDeadlineReminder3Days, 
    sendDeadlineReminder1Day, 
    sendTaskReminderEmail 
} from './emailService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

//
// Connect to DB
//
const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return; // already connected
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB for deadline reminders');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

//
// Helper function to get date X days from now
//
const getDaysFromNow = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(23, 59, 59, 999); // End of day
    return date;
};

const getStartOfDay = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
};

//
// Send 5-day reminders
//
const send5DayReminders = async () => {
    try {
        console.log('Checking for 5-day deadline reminders...');
        
        const startOf5Days = getStartOfDay(5);
        const endOf5Days = getDaysFromNow(5);

        const tasks = await Task.find({
            dueDate: { 
                $gte: startOf5Days,
                $lte: endOf5Days
            },
            status: { $ne: 'completed' },
            'notifications.remindersSent.fiveDays': false
        }).populate('assignedTo', 'name email')
          .populate('taskMaker', 'name email');

        if (tasks.length === 0) {
            console.log('No tasks due in 5 days requiring reminders');
            return;
        }

        console.log(`Found ${tasks.length} tasks due in 5 days`);

        // Group tasks by assignee
        const tasksByUser = {};
        
        for (const task of tasks) {
            for (const user of task.assignedTo) {
                if (!tasksByUser[user._id]) {
                    tasksByUser[user._id] = {
                        user: user,
                        tasks: []
                    };
                }
                tasksByUser[user._id].tasks.push(task);
            }
        }

        // Send emails to each user
        for (const userId in tasksByUser) {
            const { user, tasks: userTasks } = tasksByUser[userId];
            
            try {
                await sendDeadlineReminder5Days(user.email, user.name, userTasks);
                console.log(`5-day reminder sent to ${user.email} for ${userTasks.length} task(s)`);
                
                // Mark reminders as sent
                for (const task of userTasks) {
                    await Task.updateOne(
                        { _id: task._id },
                        { $set: { 'notifications.remindersSent.fiveDays': true } }
                    );
                }
            } catch (err) {
                console.error(`Failed to send 5-day reminder to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error sending 5-day reminders:', err.message);
    }
};

//
// Send 3-day reminders
//
const send3DayReminders = async () => {
    try {
        console.log('Checking for 3-day deadline reminders...');
        
        const startOf3Days = getStartOfDay(3);
        const endOf3Days = getDaysFromNow(3);

        const tasks = await Task.find({
            dueDate: { 
                $gte: startOf3Days,
                $lte: endOf3Days
            },
            status: { $ne: 'completed' },
            'notifications.remindersSent.threeDays': false
        }).populate('assignedTo', 'name email')
          .populate('taskMaker', 'name email');

        if (tasks.length === 0) {
            console.log('No tasks due in 3 days requiring reminders');
            return;
        }

        console.log(`Found ${tasks.length} tasks due in 3 days`);

        // Group tasks by assignee
        const tasksByUser = {};
        
        for (const task of tasks) {
            for (const user of task.assignedTo) {
                if (!tasksByUser[user._id]) {
                    tasksByUser[user._id] = {
                        user: user,
                        tasks: []
                    };
                }
                tasksByUser[user._id].tasks.push(task);
            }
        }

        // Send emails to each user
        for (const userId in tasksByUser) {
            const { user, tasks: userTasks } = tasksByUser[userId];
            
            try {
                await sendDeadlineReminder3Days(user.email, user.name, userTasks);
                console.log(`3-day reminder sent to ${user.email} for ${userTasks.length} task(s)`);
                
                // Mark reminders as sent
                for (const task of userTasks) {
                    await Task.updateOne(
                        { _id: task._id },
                        { $set: { 'notifications.remindersSent.threeDays': true } }
                    );
                }
            } catch (err) {
                console.error(`Failed to send 3-day reminder to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error sending 3-day reminders:', err.message);
    }
};

//
// Send 1-day reminders
//
const send1DayReminders = async () => {
    try {
        console.log('Checking for 1-day deadline reminders...');
        
        const startOfTomorrow = getStartOfDay(1);
        const endOfTomorrow = getDaysFromNow(1);

        const tasks = await Task.find({
            dueDate: { 
                $gte: startOfTomorrow,
                $lte: endOfTomorrow
            },
            status: { $ne: 'completed' },
            'notifications.remindersSent.oneDay': false
        }).populate('assignedTo', 'name email')
          .populate('taskMaker', 'name email');

        if (tasks.length === 0) {
            console.log('No tasks due tomorrow requiring reminders');
            return;
        }

        console.log(`Found ${tasks.length} tasks due tomorrow - URGENT`);

        // Group tasks by assignee
        const tasksByUser = {};
        
        for (const task of tasks) {
            for (const user of task.assignedTo) {
                if (!tasksByUser[user._id]) {
                    tasksByUser[user._id] = {
                        user: user,
                        tasks: []
                    };
                }
                tasksByUser[user._id].tasks.push(task);
            }
        }

        // Send emails to each user
        for (const userId in tasksByUser) {
            const { user, tasks: userTasks } = tasksByUser[userId];
            
            try {
                await sendDeadlineReminder1Day(user.email, user.name, userTasks);
                console.log(`1-day URGENT reminder sent to ${user.email} for ${userTasks.length} task(s)`);
                
                // Mark reminders as sent
                for (const task of userTasks) {
                    await Task.updateOne(
                        { _id: task._id },
                        { $set: { 'notifications.remindersSent.oneDay': true } }
                    );
                }
            } catch (err) {
                console.error(`Failed to send 1-day reminder to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error sending 1-day reminders:', err.message);
    }
};

//
// Send overdue reminders (existing functionality)
//
const sendOverdueReminders = async () => {
    try {
        console.log('Checking for overdue task reminders...');
        
        const now = new Date();

        const tasks = await Task.find({
            dueDate: { $lt: now },
            status: { $ne: 'completed' },
            'notifications.remindersSent.overdue': false
        }).populate('assignedTo', 'name email')
          .populate('taskMaker', 'name email');

        if (tasks.length === 0) {
            console.log('No overdue tasks requiring reminders');
            return;
        }

        console.log(`Found ${tasks.length} overdue tasks`);

        // Group tasks by assignee
        const tasksByUser = {};
        
        for (const task of tasks) {
            for (const user of task.assignedTo) {
                if (!tasksByUser[user._id]) {
                    tasksByUser[user._id] = {
                        user: user,
                        tasks: []
                    };
                }
                tasksByUser[user._id].tasks.push(task);
            }
        }

        // Send emails to each user
        for (const userId in tasksByUser) {
            const { user, tasks: userTasks } = tasksByUser[userId];
            
            try {
                await sendTaskReminderEmail(user.email, user.name, userTasks);
                console.log(`Overdue reminder sent to ${user.email} for ${userTasks.length} task(s)`);
                
                // Mark reminders as sent
                for (const task of userTasks) {
                    await Task.updateOne(
                        { _id: task._id },
                        { $set: { 'notifications.remindersSent.overdue': true } }
                    );
                }
            } catch (err) {
                console.error(`Failed to send overdue reminder to ${user.email}:`, err.message);
            }
        }
    } catch (err) {
        console.error('Error sending overdue reminders:', err.message);
    }
};

//
// Combined function to run all reminder checks
//
const runAllReminderChecks = async () => {
    console.log('Starting deadline reminder checks...');
    await send5DayReminders();
    await send3DayReminders();
    await send1DayReminders();
    await sendOverdueReminders();
    console.log('All deadline reminder checks completed');
};

//
// Schedule cron jobs (runs only when imported, not direct execution)
//
if (!(typeof require !== 'undefined' && require.main === module)) {
    (async () => {
        await connectDB();
        
        // Run every day at 9:00 AM
        cron.schedule('0 9 * * *', runAllReminderChecks);
        console.log('Deadline reminder cron scheduled (daily at 9:00 AM)');
        
        // Optional: Run additional check at 6:00 PM for urgent reminders
        cron.schedule('0 18 * * *', async () => {
            console.log('Evening reminder check...');
            await send1DayReminders();
        });
        console.log('Evening urgent reminder cron scheduled (daily at 6:00 PM)');
    })();
}

//
// Manual run when executed directly (useful for testing)
//
if (typeof require !== 'undefined' && require.main === module) {
    (async () => {
        await connectDB();
        await runAllReminderChecks();
        console.log('✅ Manual deadline reminder run complete.');
        process.exit(0);
    })();
}

export default runAllReminderChecks;


