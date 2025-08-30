import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

// Middleware to verify JWT token
export const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') || 
                     req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Middleware to check if user is a senior (can create tasks)
export const requireSenior = (req, res, next) => {
    if (req.user.role !== 'senior') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Senior role required.'
        });
    }
    next();
};

// Middleware to check if user is an admin
export const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin role required.'
        });
    }
    next();
};

// Middleware to check if user can access task (same domain or task creator/assignee)
export const checkTaskAccess = async (req, res, next) => {
    try {
        const { Task } = await import('../models/Task.js');
        const taskId = req.params.id;
        
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if user has access to this task
        const hasAccess = 
            task.domain === req.user.domain ||
            task.taskMaker.toString() === req.user._id.toString() ||
            task.assignedTo.toString() === req.user._id.toString();

        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission to access this task.'
            });
        }

        req.task = task;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error checking task access'
        });
    }
};
