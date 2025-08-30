import express from 'express';
import { testEmailConfiguration, sendTaskAssignmentEmail } from '../services/emailService.js';

const router = express.Router();

// Test email configuration
router.get('/test-config', async (req, res) => {
    try {
        await testEmailConfiguration();
        res.json({
            success: true,
            message: 'Email configuration is working correctly!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email configuration test failed',
            error: error.message
        });
    }
});

// Test sending email
router.post('/test-send', async (req, res) => {
    try {
        const { to, name } = req.body;
        
        if (!to || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide "to" email and "name"'
            });
        }
        
        await sendTaskAssignmentEmail(
            to,
            name,
            'Test Task Assignment',
            'This is a test email to verify the email system is working correctly.',
            new Date(Date.now() + 24 * 60 * 60 * 1000), // Due tomorrow
            'System Test'
        );
        
        res.json({
            success: true,
            message: `Test email sent successfully to ${to}!`
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

export default router;
