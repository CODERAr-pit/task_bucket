import { Task } from "../models/Task.js";
import { canViewTask } from "../utils/visibility.js";

// Delete existing task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid task ID format'
            });
        }

        // Find existing task
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // Check if user can view this task based on visibility
        if (!canViewTask(existingTask, req.user._id)) {
            return res.status(404).json({
                error: 'Task not found or you do not have permission to delete it'
            });
        }

        // Security: User can only delete tasks in their domain
        const userDomain = req.user.domain;
        if (existingTask.domain !== userDomain) {
            return res.status(403).json({
                error: 'You can only delete tasks in your domain'
            });
        }

        // Additional permission check
        // Only allow task creator, assigned user, or senior to delete
        const userId = req.user._id.toString();
        const isTaskCreator = existingTask.taskMaker && existingTask.taskMaker.toString() === userId;
        const isAssignedUser = existingTask.assignedTo && existingTask.assignedTo.toString() === userId;
        const isSenior = req.user.role === 'senior';

        if (!isTaskCreator && !isAssignedUser && !isSenior) {
            return res.status(403).json({
                error: 'You do not have permission to delete this task'
            });
        }

        // Delete the task
        await Task.findByIdAndDelete(id);

        // Return success response
        res.status(200).json({
            message: 'Task deleted successfully',
            data: null
        });

    } catch (error) {
        console.error('Error in deleteTask:', error);
        
        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid task ID format',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to delete task',
            details: error.message
        });
    }
};

// Soft delete variant (marks as deleted instead of removing)
const softDeleteTask = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid task ID format'
            });
        }

        // Find existing task
        const existingTask = await Task.findById(id);
        if (!existingTask) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // Security checks
        const userDomain = req.user.domain;
        if (existingTask.domain !== userDomain) {
            return res.status(403).json({
                error: 'You can only delete tasks in your domain'
            });
        }

        // Permission checks
        const userId = req.user._id.toString();
        const isTaskCreator = existingTask.taskMaker && existingTask.taskMaker.toString() === userId;
        const isAssignedUser = existingTask.assignedTo && existingTask.assignedTo.toString() === userId;
        const isSenior = req.user.role === 'senior';

        if (!isTaskCreator && !isAssignedUser && !isSenior) {
            return res.status(403).json({
                error: 'You do not have permission to delete this task'
            });
        }

        // Soft delete - mark as deleted (you'll need to add these fields to your Task model if you want this feature)
        await Task.findByIdAndUpdate(id, {
            status: 'deleted',
            deletedAt: new Date(),
            deletedBy: req.user._id
        });

        res.status(200).json({
            message: 'Task deleted successfully',
            data: null
        });

    } catch (error) {
        console.error('Error in softDeleteTask:', error);
        res.status(500).json({
            error: 'Failed to delete task',
            details: error.message
        });
    }
};

// Bulk delete tasks
const bulkDeleteTasks = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of task IDs'
            });
        }

        // Validate all IDs
        const invalidIds = ids.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
        if (invalidIds.length > 0) {
            return res.status(400).json({
                error: 'Invalid task ID format',
                invalidIds
            });
        }

        // Find all tasks
        const tasks = await Task.find({ _id: { $in: ids } });
        
        if (tasks.length === 0) {
            return res.status(404).json({
                error: 'No tasks found with provided IDs'
            });
        }

        const userDomain = req.user.domain;
        const userId = req.user._id.toString();
        const isSenior = req.user.role === 'senior';

        // Check permissions for each task
        const unauthorizedTasks = tasks.filter(task => {
            if (task.domain !== userDomain) return true;
            
            if (isSenior) return false;
            
            const isTaskCreator = task.taskMaker && task.taskMaker.toString() === userId;
            const isAssignedUser = task.assignedTo && task.assignedTo.toString() === userId;
            
            return !isTaskCreator && !isAssignedUser;
        });

        if (unauthorizedTasks.length > 0) {
            return res.status(403).json({
                error: 'You do not have permission to delete some tasks',
                unauthorizedTaskIds: unauthorizedTasks.map(task => task._id)
            });
        }

        // Delete all authorized tasks
        const result = await Task.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            message: `${result.deletedCount} tasks deleted successfully`,
            data: {
                deletedCount: result.deletedCount,
                requestedCount: ids.length
            }
        });

    } catch (error) {
        console.error('Error in bulkDeleteTasks:', error);
        res.status(500).json({
            error: 'Failed to delete tasks',
            details: error.message
        });
    }
};

export { deleteTask, softDeleteTask, bulkDeleteTasks };
