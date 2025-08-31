import { Task } from "../models/Task.js";
import { getTaskPermissions as getPermissions } from "../utils/permissions.js";

// Get user permissions for a specific task
const getTaskPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid task ID format'
            });
        }

        // Get task with populated user data
        const task = await Task.findById(id)
            .populate('assignedTo', 'name email role')
            .populate('taskMaker', 'name email role');

        if (!task) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // Remove domain restriction - allow permissions check for all tasks
        // const userDomain = req.user.domain;
        // if (task.domain !== userDomain) {
        //     return res.status(403).json({
        //         error: 'You can only check permissions for tasks in your domain'
        //     });
        // }

        // Get permissions
        const permissions = getPermissions(req.user, task.assignedTo, task.taskMaker);

        res.status(200).json({
            success: true,
            permissions: {
                canEdit: permissions.canEdit,
                canUpdateStatus: permissions.canUpdateStatus,
                userRole: req.user.role,
                userRoleLevel: permissions.roleLevel
            }
        });

    } catch (error) {
        console.error('Error in getTaskPermissions:', error);
        res.status(500).json({
            error: 'Failed to get task permissions',
            details: error.message
        });
    }
};

export { getTaskPermissions };
