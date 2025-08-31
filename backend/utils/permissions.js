// Permission utilities for role-based access control

/**
 * Get the numeric value for a role (higher number = more senior)
 */
const getRoleLevel = (role) => {
    const roleLevels = {
        '1st Year': 1,
        '2nd Year': 2, 
        '3rd Year': 3,
        '4th Year': 4
    };
    return roleLevels[role] || 0;
};

/**
 * Check if user can edit a task (full edit permissions)
 * Rule: Only seniors of the same year or above can edit all task fields
 * 
 * @param {Object} currentUser - The user trying to edit
 * @param {Object} assignedUsers - Array of users assigned to the task
 * @param {Object} taskMaker - User who created the task
 * @returns {boolean} - True if user can edit all fields
 */
const canEditTask = (currentUser, assignedUsers = [], taskMaker = null) => {
    const currentUserLevel = getRoleLevel(currentUser.role);
    
    // Get all users involved in the task (assignees + task maker)
    const allInvolvedUsers = [...assignedUsers];
    if (taskMaker) {
        allInvolvedUsers.push(taskMaker);
    }
    
    // Check if current user is senior or equal to all involved users
    for (const user of allInvolvedUsers) {
        const userLevel = getRoleLevel(user.role);
        if (currentUserLevel < userLevel) {
            return false; // Current user is junior to someone involved
        }
    }
    
    return true;
};

/**
 * Check if user can update task status
 * Rule: Anyone can change the status of a task they're assigned to or created
 * 
 * @param {Object} currentUser - The user trying to update status
 * @param {Object} assignedUsers - Array of users assigned to the task
 * @param {Object} taskMaker - User who created the task
 * @returns {boolean} - True if user can update status
 */
const canUpdateTaskStatus = (currentUser, assignedUsers = [], taskMaker = null) => {
    const currentUserId = currentUser._id?.toString();
    
    // Check if user is the task maker
    if (taskMaker && taskMaker._id?.toString() === currentUserId) {
        return true;
    }
    
    // Check if user is assigned to the task
    const isAssigned = assignedUsers.some(user => 
        user._id?.toString() === currentUserId
    );
    
    return isAssigned;
};

/**
 * Get user permission level for a task
 * 
 * @param {Object} currentUser - The user
 * @param {Object} assignedUsers - Array of users assigned to the task
 * @param {Object} taskMaker - User who created the task
 * @returns {Object} - Permission object
 */
const getTaskPermissions = (currentUser, assignedUsers = [], taskMaker = null) => {
    return {
        canEdit: canEditTask(currentUser, assignedUsers, taskMaker),
        canUpdateStatus: canUpdateTaskStatus(currentUser, assignedUsers, taskMaker),
        roleLevel: getRoleLevel(currentUser.role)
    };
};

export {
    getRoleLevel,
    canEditTask,
    canUpdateTaskStatus,
    getTaskPermissions
};
