// Visibility utilities for task privacy control

import mongoose from 'mongoose';

/**
 * Add visibility filter to a MongoDB query
 * Private tasks are only visible to the task maker and assignees
 * Tasks without visibility field are treated as public for backward compatibility
 * 
 * @param {Object} query - Mongoose query object
 * @param {String} currentUserId - ID of the current user
 * @returns {Object} - Modified query with visibility filter
 */
const addVisibilityFilter = (query, currentUserId) => {
    // Ensure currentUserId is a valid ObjectId
    if (!currentUserId) {
        return query.or([
            { visibility: 'public' },
            { visibility: { $exists: false } }
        ]);
    }
    
    // Convert to ObjectId if it's a string
    let userObjectId;
    try {
        userObjectId = mongoose.Types.ObjectId.isValid(currentUserId) 
            ? new mongoose.Types.ObjectId(currentUserId) 
            : currentUserId;
    } catch (error) {
        return query.or([
            { visibility: 'public' },
            { visibility: { $exists: false } }
        ]);
    }
    
    return query.or([
        { visibility: 'public' },
        { visibility: { $exists: false } }, // Backward compatibility - tasks without visibility field are public
        { 
            visibility: 'private',
            $or: [
                { taskMaker: userObjectId },
                { assignedTo: { $in: [userObjectId] } }
            ]
        }
    ]);
};

/**
 * Check if a user can view a specific task
 * 
 * @param {Object} task - Task object
 * @param {String} currentUserId - ID of the current user
 * @returns {Boolean} - True if user can view the task
 */
const canViewTask = (task, currentUserId) => {
    // If no user ID, can only see public tasks
    if (!currentUserId) {
        return !task.visibility || task.visibility === 'public';
    }
    
    // If no visibility field, treat as public for backward compatibility
    if (!task.visibility || task.visibility === 'public') {
        return true;
    }
    
    if (task.visibility === 'private') {
        // Convert IDs to strings for comparison
        const currentUserStr = currentUserId.toString();
        
        // Check if user is task maker
        if (task.taskMaker && task.taskMaker.toString() === currentUserStr) {
            return true;
        }
        
        // Check if user is assigned to the task
        if (task.assignedTo && Array.isArray(task.assignedTo)) {
            return task.assignedTo.some(assigneeId => 
                assigneeId.toString() === currentUserStr
            );
        } else if (task.assignedTo) {
            return task.assignedTo.toString() === currentUserStr;
        }
    }
    
    return false;
};

export {
    addVisibilityFilter,
    canViewTask
};
