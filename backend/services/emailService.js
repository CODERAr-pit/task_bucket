import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Resend sends over HTTPS (port 443), so it works on hosts like Render
// that block outbound SMTP ports (25 / 465 / 587).
const resend = new Resend(process.env.RESEND_API_KEY);

// One-line `sendEmail(...)` for every call site below
const sendEmail = async ({ to, subject, html }) => {
    const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL,
        to,
        subject,
        html
    });

    if (error) {
        throw new Error(error.message || 'Failed to send email via Resend');
    }

    return data;
};

// Email templates
const emailTemplates = {
    newUserRegistration: (userName, userEmail, userId, userRole, userDomains) => ({
        subject: 'New User Registration - Action Required',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #374151; margin: 10px 0; font-size: 18px; font-weight: 500;">New User Registration</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">A new user has registered and requires admin approval:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Name:</td><td style="padding: 8px 0; color: #1f2937;">${userName}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Email:</td><td style="padding: 8px 0; color: #1f2937;">${userEmail}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Role:</td><td style="padding: 8px 0; color: #1f2937;">${userRole}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Domains:</td><td style="padding: 8px 0; color: #1f2937;">${userDomains && userDomains.length > 0 ? userDomains.join(', ') : 'Not specified'}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">User ID:</td><td style="padding: 8px 0; color: #6b7280; font-family: monospace; font-size: 12px;">${userId}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Registration Date:</td><td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleDateString()}</td></tr>
                        <tr><td style="padding: 8px 0; font-weight: 600; color: #4b5563;">Status:</td><td style="padding: 8px 0; color: #d97706; font-weight: 600;">Pending Approval</td></tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/${userId}" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                        Review User
                    </a>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">
                        Login with your admin credentials to approve or reject this user
                    </p>
                </div>
                
                <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-top: 24px;">
                    <h3 style="color: #475569; margin-top: 0; font-size: 16px; font-weight: 600;">Admin Actions Available:</h3>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                        <li><strong>Approve User</strong> - Grant access to TaskBucket</li>
                        <li><strong>Reject User</strong> - Deny access with optional reason</li>
                        <li><strong>View Dashboard</strong> - Monitor pending registrations</li>
                    </ul>
                </div>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),
    
    userApproved: (userName) => ({
        subject: 'Account Approved - Welcome to TaskBucket',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #059669; margin: 10px 0; font-size: 18px; font-weight: 500;">Account Approved</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Your account has been approved by an administrator. You can now access TaskBucket to manage tasks and collaborate with your team.</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/" 
                       style="display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                       Access Dashboard
                    </a>
                </div>
                
                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-top: 24px;">
                    <h3 style="color: #15803d; margin-top: 0; font-size: 16px; font-weight: 600;">Getting Started:</h3>
                    <ul style="color: #15803d; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                        <li>Log in with your registered credentials</li>
                        <li>Complete your profile setup</li>
                        <li>Explore the task management features</li>
                    </ul>
                </div>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),
    
    userRejected: (userName, reason = '') => ({
        subject: 'Account Registration Declined',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #dc2626; margin: 10px 0; font-size: 18px; font-weight: 500;">Registration Update</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Your account registration for TaskBucket has been declined by an administrator.</p>
                
                ${reason ? `<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 24px 0;">
                    <h3 style="color: #dc2626; margin-top: 0; font-size: 16px; font-weight: 600;">Reason:</h3>
                    <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.6;">${reason}</p>
                </div>` : ''}
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">If you believe this is an error or have questions about this decision, please contact our support team.</p>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),
    
    taskAssigned: (userName, taskTitle, taskDescription, dueDate, assignedBy) => ({
        subject: `New Task Assigned: ${taskTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #2563eb; margin: 10px 0; font-size: 18px; font-weight: 500;">New Task Assignment</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">You have been assigned a new task in TaskBucket:</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <h3 style="margin-top: 0; color: #1f2937; font-size: 18px; font-weight: 600;">${taskTitle}</h3>
                    <div style="margin: 16px 0;">
                        <p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Description:</strong> ${taskDescription}</p>
                        <p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
                        <p style="margin: 8px 0; color: #4b5563; font-size: 14px;"><strong>Assigned By:</strong> ${assignedBy}</p>
                    </div>
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                       View Task Details
                    </a>
                </div>
                
                <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-top: 24px;">
                    <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">Please log in to TaskBucket to view full task details, update progress, and collaborate with your team.</p>
                </div>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br />
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),
    
    taskReminder: (userName, tasks) => ({
        subject: 'Task Reminder - Tasks Due Soon',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #d97706; margin: 10px 0; font-size: 18px; font-weight: 500;">Task Reminder</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">This is a friendly reminder that you have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due soon:</p>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    ${tasks.map(task => `
                        <div style="margin-bottom: 16px; padding: 16px; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb;">
                            <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${task.title}</h4>
                            <p style="margin: 4px 0; color: #4b5563; font-size: 14px;"><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Status:</strong> ${task.status.replace('-', ' ')}</p>
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                        View All Tasks
                    </a>
                </div>
                
                <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-top: 24px;">
                    <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">Please review and update your task progress to stay on track with your deadlines.</p>
                </div>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br />
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),

    deadlineReminder5Days: (userName, tasks) => ({
        subject: 'Task Deadline Reminder - 5 Days Remaining',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #374151; margin: 10px 0; font-size: 18px; font-weight: 500;">Task Deadline Notification</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} with upcoming deadlines in 5 days. Please review your schedule and plan accordingly.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    ${tasks.map(task => `
                        <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                            <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px; font-weight: 600;">${task.title}</h3>
                            <div style="margin-bottom: 8px;">
                                <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Due Date:</span>
                                <span style="color: #374151; font-size: 14px; font-weight: 600;">${new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Status:</span>
                                <span style="color: #374151; font-size: 14px; text-transform: capitalize;">${task.status.replace('-', ' ')}</span>
                            </div>
                            <div style="margin-bottom: 8px;">
                                <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Priority:</span>
                                <span style="color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669'}; font-size: 14px; font-weight: 600; text-transform: capitalize;">${task.priority}</span>
                            </div>
                            ${task.description ? `<div style="margin-top: 12px; padding: 12px; background-color: #ffffff; border-radius: 4px; border: 1px solid #e5e7eb;"><p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${task.description.length > 150 ? task.description.substring(0, 150) + '...' : task.description}</p></div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                        View Tasks
                    </a>
                </div>
                
                <div style="background-color: #f1f5f9; border-left: 4px solid #2563eb; padding: 16px; margin-top: 24px;">
                    <h4 style="margin: 0 0 12px 0; color: #1e293b; font-size: 16px; font-weight: 600;">Recommended Actions:</h4>
                    <ul style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 16px;">
                        <li style="margin-bottom: 6px;">Review task requirements and deliverables</li>
                        <li style="margin-bottom: 6px;">Assess current progress and identify any blockers</li>
                        <li style="margin-bottom: 6px;">Update task status to reflect current progress</li>
                        <li>Communicate with team members if assistance is needed</li>
                    </ul>
                </div>
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),

    deadlineReminder3Days: (userName, tasks) => ({
        subject: 'Important: Task Deadline Alert - 3 Days Remaining',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 2px solid #d97706; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #b45309; margin: 10px 0; font-size: 18px; font-weight: 600;">Task Deadline Alert</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.6;"><strong>Important Notice:</strong> You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due in 3 days. Immediate attention and prioritization are recommended.</p>
                
                <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    ${tasks.map(task => `
                        <div style="margin-bottom: 20px; padding: 16px; background-color: #ffffff; border-radius: 6px; border: 1px solid #f59e0b;">
                            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 18px; font-weight: 700;">${task.title}</h3>
                            <div style="background-color: #fef3c7; padding: 12px; border-radius: 4px; margin-bottom: 12px;">
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #92400e; font-size: 14px; font-weight: 600;">Due Date:</span>
                                    <span style="color: #92400e; font-size: 14px; font-weight: 700;">${new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #92400e; font-size: 14px; font-weight: 600;">Time Remaining:</span>
                                    <span style="color: #dc2626; font-size: 14px; font-weight: 700;">3 Days</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Status:</span>
                                    <span style="color: #374151; font-size: 14px; text-transform: capitalize; font-weight: 600;">${task.status.replace('-', ' ')}</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Priority:</span>
                                    <span style="color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669'}; font-size: 14px; font-weight: 700; text-transform: capitalize;">${task.priority}</span>
                                </div>
                            </div>
                            ${task.description ? `<div style="padding: 12px; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;"><p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${task.description.length > 120 ? task.description.substring(0, 120) + '...' : task.description}</p></div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background-color: #d97706; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Review Tasks Now
                    </a>
                </div>
                
              
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br>
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    }),

    deadlineReminder1Day: (userName, tasks) => ({
        subject: 'Urgent: Task Due Tomorrow - Action Required',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                <div style="text-align: center; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #1f2937; margin: 0; font-size: 24px; font-weight: 600;">TaskBucket</h1>
                    <h2 style="color: #dc2626; margin: 10px 0; font-size: 18px; font-weight: 600;">Urgent Task Deadline Alert</h2>
                </div>
                
                <p style="font-size: 16px; color: #374151; line-height: 1.6;">Dear ${userName},</p>
                <p style="font-size: 16px; color: #dc2626; line-height: 1.6; font-weight: 600;">Important: You have ${tasks.length} task${tasks.length > 1 ? 's' : ''} due tomorrow. Immediate attention is required.</p>
                
                <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    ${tasks.map(task => `
                        <div style="margin-bottom: 20px; padding: 20px; background-color: #ffffff; border-radius: 6px; border: 1px solid #dc2626;">
                            <h3 style="margin: 0 0 16px 0; color: #dc2626; font-size: 18px; font-weight: 700;">${task.title}</h3>
                            <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px; margin-bottom: 16px; border: 1px solid #fecaca;">
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #dc2626; font-size: 14px; font-weight: 600;">Due Date:</span>
                                    <span style="color: #dc2626; font-size: 16px; font-weight: 700;">${new Date(task.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #dc2626; font-size: 14px; font-weight: 600;">Time Remaining:</span>
                                    <span style=" color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">Less than 24 hours</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Status:</span>
                                    <span style="color: ${task.status === 'completed' ? '#059669' : '#dc2626'}; font-size: 14px; text-transform: capitalize; font-weight: 600;">${task.status.replace('-', ' ')}</span>
                                </div>
                                <div style="margin-bottom: 8px;">
                                    <span style="display: inline-block; margin-right: 16px; color: #6b7280; font-size: 14px; font-weight: 500;">Priority:</span>
                                    <span style="color: ${task.priority === 'high' ? '#dc2626' : task.priority === 'medium' ? '#d97706' : '#059669'}; font-size: 14px; font-weight: 600; text-transform: capitalize;">${task.priority}</span>
                                </div>
                            </div>
                            ${task.description ? `<div style="padding: 12px; background-color: #f8fafc; border-radius: 4px; border: 1px solid #e2e8f0;"><p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5;">${task.description.length > 100 ? task.description.substring(0, 100) + '...' : task.description}</p></div>` : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${process.env.FRONTEND_URL || process.env.CLIENT_URL}/dashboard" 
                       style="display: inline-block; background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                        Complete Tasks Now
                    </a>
                </div>
                
             
                
                <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                        This is an automated notification from TaskBucket<br />
                        ${new Date().toLocaleString()}
                    </p>
                </div>
            </div>
        `
    })
};

// Send email functions
export const sendNewUserNotificationToAdmins = async (userName, userEmail, userId, userRole, userDomains) => {
    try {
        const adminEmails = process.env.ADMIN_EMAILS.split(',');
        const template = emailTemplates.newUserRegistration(userName, userEmail, userId, userRole, userDomains);
        
        for (const adminEmail of adminEmails) {
            await sendEmail({
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
        const template = emailTemplates.userApproved(userName);
        
        await sendEmail({
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
        const template = emailTemplates.userRejected(userName, reason);
        
        await sendEmail({
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
        const template = emailTemplates.taskAssigned(userName, taskTitle, taskDescription, dueDate, assignedBy);
        
        await sendEmail({
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
        const template = emailTemplates.taskReminder(userName, tasks);
        
        await sendEmail({
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

export const sendDeadlineReminder5Days = async (userEmail, userName, tasks) => {
    try {
        const template = emailTemplates.deadlineReminder5Days(userName, tasks);
        
        await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`5-day deadline reminder sent to: ${userEmail}`);
        return { success: true, message: '5-day deadline reminder sent successfully' };
    } catch (error) {
        console.error('Error sending 5-day deadline reminder:', error);
        throw error;
    }
};

export const sendDeadlineReminder3Days = async (userEmail, userName, tasks) => {
    try {
        const template = emailTemplates.deadlineReminder3Days(userName, tasks);
        
        await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`3-day deadline reminder sent to: ${userEmail}`);
        return { success: true, message: '3-day deadline reminder sent successfully' };
    } catch (error) {
        console.error('Error sending 3-day deadline reminder:', error);
        throw error;
    }
};

export const sendDeadlineReminder1Day = async (userEmail, userName, tasks) => {
    try {
        const template = emailTemplates.deadlineReminder1Day(userName, tasks);
        
        await sendEmail({
            to: userEmail,
            subject: template.subject,
            html: template.html
        });
        
        console.log(`1-day deadline reminder sent to: ${userEmail}`);
        return { success: true, message: '1-day deadline reminder sent successfully' };
    } catch (error) {
        console.error('Error sending 1-day deadline reminder:', error);
        throw error;
    }
};

// Test email function for setup verification
// Sends a real test email to confirm the API key and FROM_EMAIL work.
export const testEmailConfiguration = async () => {
    try {
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not set');
        }
        if (!process.env.FROM_EMAIL) {
            throw new Error('FROM_EMAIL is not set');
        }

        await sendEmail({
            to: process.env.ADMIN_EMAILS?.split(',')[0]?.trim() || process.env.FROM_EMAIL,
            subject: 'TaskBucket Email Configuration Test',
            html: '<p>This is a test email confirming your Resend configuration is working.</p>'
        });

        console.log('Email configuration is valid and ready to send emails');
        return { success: true, message: 'Email configuration verified successfully' };
    } catch (error) {
        console.error('Email configuration test failed:', error);
        throw error;
    }
};