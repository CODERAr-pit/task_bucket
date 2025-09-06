#!/usr/bin/env node
import runAllReminderChecks from './deadlineReminderJob.js';

console.log('🧪 Testing deadline reminders...');
console.log('This will check for tasks due in 5, 3, 1 days and overdue tasks');
console.log('Make sure you have tasks with appropriate due dates for testing');

// Run the reminder checks manually
runAllReminderChecks()
    .then(() => {
        console.log('✅ Test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
