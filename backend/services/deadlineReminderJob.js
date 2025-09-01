// import cron from 'node-cron';
// import { Task } from '../models/Task.js';
// import { User } from '../models/User.js';
// import { sendTaskReminderEmail } from './emailService.js';

// const sendDeadlineMissedReminders = async () => {
//   const now = new Date();
//   const tasks = await Task.find({
//     dueDate: { $lt: now },
//     status: { $ne: 'completed' }
//   }).populate('assignedTo', 'name email');

//   for (const task of tasks) {
//     for (const user of task.assignedTo) {
//       await sendTaskReminderEmail(user.email, user.name, [task]);
//     }
//   }
// };

// // Run every hour
// cron.schedule('0 * * * *', sendDeadlineMissedReminders);



// // Manual trigger for testing
// if (typeof require !== 'undefined' && require.main === module) {
//   sendDeadlineMissedReminders().then(() => {
//     console.log('Manual deadline reminder run complete.');
//     process.exit(0);
//   });
// }

// export default sendDeadlineMissedReminders;


// import cron from 'node-cron';
// import { Task } from '../models/Task.js';
// import { sendTaskReminderEmail } from './emailService.js';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// dotenv.config();
// console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);


// //
// // Connect to DB
// //
// const connectDB = async () => {
//   if (mongoose.connection.readyState === 1) return; // already connected
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('✅ Connected to MongoDB');
//   } catch (err) {
//     console.error('❌ MongoDB connection error:', err.message);
//     process.exit(1);
//   }
// };

// //
// // Main function to send deadline missed reminders
// //
// const sendDeadlineMissedReminders = async () => {
//   try {
//     const now = new Date();

//     const tasks = await Task.find({
//       dueDate: { $lt: now },
//       status: { $ne: 'completed' }
//     }).populate('assignedTo', 'name email');

//     if (tasks.length === 0) {
//       console.log('✅ No overdue tasks found.');
//       return;
//     }

//     for (const task of tasks) {
//       for (const user of task.assignedTo) {
//         try {
//           await sendTaskReminderEmail(user.email, user.name, [task]);
//           console.log(`📧 Reminder sent to ${user.email} for task: "${task.title}"`);
//         } catch (err) {
//           console.error(`❌ Failed to send email to ${user.email}:`, err.message);
//         }
//       }
//     }
//   } catch (err) {
//     console.error('⚠️ Error checking overdue tasks:', err.message);
//   }
// };

// //
// // Schedule cron (runs only when imported, not direct)
// //
// if (!(typeof require !== 'undefined' && require.main === module)) {
//   (async () => {
//     await connectDB();
//     cron.schedule('* * * * *', sendDeadlineMissedReminders);
//     console.log('⏰ Cron scheduled (every minute for testing)');
//   })();
// }

// //
// // Manual run when executed directly
// //
// if (typeof require !== 'undefined' && require.main === module) {
//   (async () => {
//     await connectDB();
//     await sendDeadlineMissedReminders();
//     console.log('✅ Manual deadline reminder run complete.');
//     process.exit(0);
//   })();
// }

// export default sendDeadlineMissedReminders;

import cron from 'node-cron';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { sendTaskReminderEmail } from './emailService.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
console.log("Loaded MONGODB_URI:", process.env.MONGODB_URI);

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
    console.log(' Connected to MongoDB');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  }
};

//
// Main function to send deadline missed reminders
//
const sendDeadlineMissedReminders = async () => {
  try {
    const now = new Date();

    // Start of today (midnight)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Find overdue tasks that haven't been reminded today
    const tasks = await Task.find({
      dueDate: { $lt: now },
      status: { $ne: 'completed' },
      $or: [
        { lastReminderSent: { $exists: false } },
        { lastReminderSent: { $lt: startOfToday } }
      ]
    }).populate('assignedTo', 'name email');

    if (tasks.length === 0) {
      console.log(' No overdue tasks found.');
      return;
    }

    for (const task of tasks) {
      for (const user of task.assignedTo) {
        try {
          await sendTaskReminderEmail(user.email, user.name, [task]);
          console.log(` Reminder sent to ${user.email} for task: "${task.title}"`);
        } catch (err) {
          console.error(` Failed to send email to ${user.email}:`, err.message);
        }
      }

      // Update reminder timestamp
      await Task.updateOne(
        { _id: task._id },
        { $set: { lastReminderSent: new Date() } }
      );
    }
  } catch (err) {
    console.error(' Error checking overdue tasks:', err.message);
  }
};

//
// Schedule cron (runs only when imported, not direct)
//
if (!(typeof require !== 'undefined' && require.main === module)) {
  (async () => {
    await connectDB();
    // Production: run once per day at midnight
    cron.schedule('0 0 * * *', sendDeadlineMissedReminders);
    console.log(' Cron scheduled (once per day at midnight)');
  })();
}

//
// Manual run when executed directly (useful for testing)
//
// Manual run when executed directly (useful for testing)

// if (process.argv[1].includes('deadlineReminderJob.js')) {
//   (async () => {
//     await connectDB();
//     await sendDeadlineMissedReminders();
//     console.log(' Manual deadline reminder run complete.');
//     process.exit(0);
//   })();
// }

export default sendDeadlineMissedReminders;


