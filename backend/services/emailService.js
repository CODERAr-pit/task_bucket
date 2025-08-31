import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Gmail transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
};

// Email templates
const emailTemplates = {
    newUserRegistration: (userName, userEmail, userId) => ({
        subject: ' New User Registration - Action Required',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #007bff; margin: 0;">TaskBucket Admin</h1>
                    <h2 style="color: #333; margin: 10px 0;">New User Registration</h2>
                </div>
                
                <p style="font-size: 16px; color: #333;">A new user has registered and needs admin approval:</p>
                
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #007bff;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; font-weight: bold; color: #495057;">Name:</td><td style="padding: 8px 0; color: #333;">${userName}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; color: #495057;">Email:</td><td style="padding: 8px 0; color: #333;">${userEmail}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; color: #495057;">User ID:</td><td style="padding: 8px 0; color: #6c757d; font-family: monospace; font-size: 12px;">${userId}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; color: #495057;">Registration Date:</td><td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString()}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: bold; color: #495057;">Status:</td><td style="padding: 8px 0; color: #ffc107; font-weight: bold;">⏳ Pending Approval</td></tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <p style="margin-bottom: 20px; font-size: 16px; color: #333; font-weight: bold;">Click below to review and approve this user:</p>
                    
                    <div style="margin-top: 25px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/${userId}" 
                           style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3); transition: all 0.3s ease;">
                            Review This User
                        </a>
                    </div>
                    
                    <p style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                        Login with your admin credentials to approve or reject this user
                    </p>
                </div>
                
                <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #b3d9ff;">
                    <h3 style="color: #0066cc; margin-top: 0; font-size: 16px;"> Admin Actions Available:</h3>
                    <ul style="color: #333; font-size: 14px; padding-left: 20px; margin-bottom: 0;">
                        <li> <strong>Approve User</strong> - Grant access to TaskBucket</li>
                        <li> <strong>Reject User</strong> - Deny access with optional reason</li>
                        <li> <strong>Send Notifications</strong> - Automatic email updates to users</li>
                        <li> <strong>View Statistics</strong> - Monitor user registration trends</li>
                    </ul>
                </div>
                
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid #ffeaa7;">
                    <p style="color: #856404; font-size: 14px; margin: 0;">
                        ⚡ <strong>Quick Tip:</strong> You can find this user in the "Pending Users" section of your admin dashboard. Use the User ID above for quick reference.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #6c757d; font-size: 12px; margin: 0;">
                        This email was sent by TaskBucket Admin System<br>
                        ${new Date().toLocaleString()} | Admin Panel: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin" style="color: #007bff;">Click Here</a>
                    </p>
                </div>
            </div>
        `
    }),
    
    userApproved: (userName) => ({
        subject: ' Account Approved - Welcome to TaskBucket!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #28a745;">Welcome to TaskBucket!</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Great news! Your account has been approved by an administrator. You can now log in and start using TaskBucket to manage your tasks and collaborate with your team.</p>
                <p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/" 
                       style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       Login Now
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">If you have any questions, please don't hesitate to contact our support team.</p>
            </div>
        `
    }),
    
    userRejected: (userName, reason = '') => ({
        subject: ' Account Registration Declined',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Registration Update</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>Unfortunately, your account registration for TaskBucket has been declined by an administrator.</p>
                ${reason ? `<div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #dc3545; margin: 20px 0;">
                    <strong>Reason:</strong> ${reason}
                </div>` : ''}
                <p>If you believe this is an error or have questions about this decision, please contact our support team.</p>
                <p style="color: #666; font-size: 14px;">Thank you for your interest in TaskBucket.</p>
            </div>
        `
    }),
    
    taskAssigned: (userName, taskTitle, taskDescription, dueDate, assignedBy) => ({
        subject: ` New Task Assigned: ${taskTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #007bff;">New Task Assigned</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>You have been assigned a new task in TaskBucket:</p>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333;">${taskTitle}</h3>
                    <p><strong>Description:</strong> ${taskDescription}</p>
                    <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                    <p><strong>Assigned By:</strong> ${assignedBy}</p>
                </div>
                <p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
                       style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       View Task
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">Please log in to TaskBucket to view full task details and update your progress.</p>
            </div>
        `
    }),
    
    taskReminder: (userName, tasks) => ({
        subject: 'Task Reminder - Tasks Due Soon',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #ffc107;">Task Reminder</h2>
                <p>Hi <strong>${userName}</strong>,</p>
                <p>This is a friendly reminder that you have <strong>${tasks.length}</strong> task(s) due soon:</p>
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${tasks.map(task => `
                        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ffeaa7;">
                            <h4 style="margin: 0 0 5px 0; color: #333;">${task.title}</h4>
                            <p style="margin: 0; color: #856404;">Due: ${new Date(task.dueDate).toLocaleDateString()}</p>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Status: ${task.status.replace('-', ' ')}</p>
                        </div>
                    `).join('')}
                </div>
                <p>
                    <a href="${process.env.FRONTEND_URL}/dashboard" 
                       style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                       View All Tasks
                    </a>
                </p>
                <p style="color: #666; font-size: 14px;">Don't let these tasks become overdue! Log in now to update your progress.</p>
            </div>
        `
    })
};

// Send email functions
export const sendNewUserNotificationToAdmins = async (userName, userEmail, userId) => {
    try {
        const transporter = createTransporter();
        const adminEmails = process.env.ADMIN_EMAILS.split(',');
        const template = emailTemplates.newUserRegistration(userName, userEmail, userId);
        
        for (const adminEmail of adminEmails) {
            await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: adminEmail.trim(),
                subject: template.subject,
                html: template.html
            });
        }
        
        console.log(`New user notification sent to ${adminEmails.length} admins`);
        return { success: true, message: 'Admin notifications sent successfully' };
    } catch (error) {
        console.error('Error sending admin notification:', error);
        throw error;
    }
};

export const sendUserApprovalEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();
        const template = emailTemplates.userApproved(userName);
        
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Approval email sent to user: ${userEmail}`);
        return { success: true, message: 'Approval email sent successfully' };
    } catch (error) {
        console.error('Error sending approval email:', error);
        throw error;
    }
};

export const sendUserRejectionEmail = async (userEmail, userName, reason) => {
    try {
        const transporter = createTransporter();
        const template = emailTemplates.userRejected(userName, reason);
        
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Rejection email sent to user: ${userEmail}`);
        return { success: true, message: 'Rejection email sent successfully' };
    } catch (error) {
        console.error('Error sending rejection email:', error);
        throw error;
    }
};

export const sendTaskAssignmentEmail = async (userEmail, userName, taskTitle, taskDescription, dueDate, assignedBy) => {
    try {
        const transporter = createTransporter();
        const template = emailTemplates.taskAssigned(userName, taskTitle, taskDescription, dueDate, assignedBy);
        
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Task assignment email sent to: ${userEmail}`);
        return { success: true, message: 'Task assignment email sent successfully' };
    } catch (error) {
        console.error('Error sending task assignment email:', error);
        throw error;
    }
};

export const sendTaskReminderEmail = async (userEmail, userName, tasks) => {
    try {
        const transporter = createTransporter();
        const template = emailTemplates.taskReminder(userName, tasks);
        
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`Task reminder email sent to: ${userEmail}`);
        return { success: true, message: 'Task reminder email sent successfully' };
    } catch (error) {
        console.error('Error sending task reminder email:', error);
        throw error;
    }
};

// Test email function for setup verification
export const testEmailConfiguration = async () => {
    try {
        const transporter = createTransporter();
        
        // Verify connection
        await transporter.verify();
        console.log('Email configuration is valid and ready to send emails');
        return { success: true, message: 'Email configuration verified successfully' };
    } catch (error) {
        console.error('Email configuration test failed:', error);
        throw error;
    }
};