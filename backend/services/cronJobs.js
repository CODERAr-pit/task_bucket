// import cron from 'node-cron';
// import { Task } from '../models/Task.js';
// import { User } from '../models/User.js';
// import { sendTaskReminderEmail } from './emailService.js';

// // Daily reminder job - runs every day at 9:00 AM
// cron.schedule('0 9 * * *', async () => {
//     console.log(' Running daily task reminder job...');
    
//     try {
//         const now = new Date();
//         const tomorrow = new Date();
//         tomorrow.setDate(tomorrow.getDate() + 1);
//         tomorrow.setHours(23, 59, 59, 999);
        
//         const today = new Date();
//         today.setHours(0, 0, 0, 0);
        
//         console.log(`Looking for tasks due between ${today.toISOString()} and ${tomorrow.toISOString()}`);
        
//         // Find tasks due within next 24 hours that are not completed
//         const upcomingTasks = await Task.find({
//             dueDate: {
//                 $gte: today,
//                 $lte: tomorrow
//             },
//             status: { $ne: 'completed' }
//         }).populate('assignedTo', 'name email').populate('taskMaker', 'name');
        
//         console.log(`Found ${upcomingTasks.length} upcoming tasks`);
        
//         if (upcomingTasks.length === 0) {
//             console.log('No upcoming tasks found. Reminder job completed.');
//             return;
//         }
        
//         // Group tasks by assigned user
//         const userTasksMap = {};
        
//         upcomingTasks.forEach(task => {
//             if (task.assignedTo && Array.isArray(task.assignedTo)) {
//                 task.assignedTo.forEach(user => {
//                     const userId = user._id.toString();
                    
//                     if (!userTasksMap[userId]) {
//                         userTasksMap[userId] = {
//                             user: {
//                                 _id: user._id,
//                                 name: user.name,
//                                 email: user.email
//                             },
//                             tasks: []
//                         };
//                     }
                    
//                     userTasksMap[userId].tasks.push({
//                         _id: task._id,
//                         title: task.title,
//                         description: task.description,
//                         dueDate: task.dueDate,
//                         status: task.status,
//                         priority: task.priority,
//                         taskMaker: task.taskMaker ? task.taskMaker.name : 'Unknown'
//                     });
//                 });
//             }
//         });
        
//         const userCount = Object.keys(userTasksMap).length;
//         console.log(`Sending reminders to ${userCount} users...`);
        
//         let successCount = 0;
//         let errorCount = 0;
        
//         // Send reminder emails
//         for (const userId in userTasksMap) {
//             const { user, tasks } = userTasksMap[userId];
            
//             try {
//                 await sendTaskReminderEmail(user.email, user.name, tasks);
//                 console.log(` Reminder sent to ${user.name} (${user.email}) for ${tasks.length} task(s)`);
                
//                 // Update reminder timestamp for each task
//                 const taskIds = tasks.map(task => task._id);
//                 await Task.updateMany(
//                     { _id: { $in: taskIds } },
//                     { $set: { 'notifications.reminded': new Date() } }
//                 );
                
//                 successCount++;
//             } catch (error) {
//                 console.error(` Failed to send reminder to ${user.name} (${user.email}):`, error.message);
//                 errorCount++;
//             }
//         }
        
//         console.log(`    Daily reminder job completed:`);
//         console.log(`    Successfully sent: ${successCount} emails`);
//         console.log(`    Failed to send: ${errorCount} emails`);
//         console.log(`    Total tasks reminded: ${upcomingTasks.length}`);
        
//     } catch (error) {
//         console.error(' Error in daily reminder job:', error);
//     }
// });

// // Weekly summary job - runs every Monday at 10:00 AM
// cron.schedule('0 10 * * 1', async () => {
//     console.log(' Running weekly task summary job...');
    
//     try {
//         const oneWeekAgo = new Date();
//         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
//         const stats = await Task.aggregate([
//             {
//                 $match: {
//                     createdAt: { $gte: oneWeekAgo }
//                 }
//             },
//             {
//                 $group: {
//                     _id: '$status',
//                     count: { $sum: 1 }
//                 }
//             }
//         ]);
        
//         console.log(' Weekly task statistics:');
//         stats.forEach(stat => {
//             console.log(`   ${stat._id}: ${stat.count} tasks`);
//         });
        
//         const totalTasks = stats.reduce((sum, stat) => sum + stat.count, 0);
//         console.log(`   Total tasks created this week: ${totalTasks}`);
        
//     } catch (error) {
//         console.error(' Error in weekly summary job:', error);
//     }
// });

// // Overdue tasks check - runs every hour during work hours (9 AM - 6 PM)
// cron.schedule('0 9-18 * * *', async () => {
//     console.log('  Checking for overdue tasks...');
    
//     try {
//         const now = new Date();
        
//         // Find tasks that are past due date and not completed
//         const overdueTasks = await Task.find({
//             dueDate: { $lt: now },
//             status: { $nin: ['completed', 'overdue'] }
//         });
        
//         if (overdueTasks.length > 0) {
//             console.log(`Found ${overdueTasks.length} overdue tasks, updating status...`);
            
//             // Update status to overdue
//             await Task.updateMany(
//                 {
//                     dueDate: { $lt: now },
//                     status: { $nin: ['completed', 'overdue'] }
//                 },
//                 { $set: { status: 'overdue' } }
//             );
            
//             console.log(` Updated ${overdueTasks.length} tasks to overdue status`);
//         }
        
//     } catch (error) {
//         console.error(' Error in overdue tasks check:', error);
//     }
// });

// // Test job for development - runs every minute (uncomment for testing)
// // cron.schedule('* * * * *', () => {
// //     console.log('🧪 Test cron job running every minute - ', new Date().toISOString());
// // });

// // console.log('    Cron jobs initialized successfully:');
// // console.log('    Daily reminders: Every day at 9:00 AM');
// // console.log('    Weekly summaries: Every Monday at 10:00 AM');
// // console.log('    Overdue check: Every hour from 9 AM - 6 PM');
// // console.log('    Current time:', new Date().toISOString());

// export { cron };
