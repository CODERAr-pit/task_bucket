import { Task } from "../models/Task.js";
import { canViewTask } from "../utils/visibility.js";
import { canDeleteTask } from "../utils/permissions.js";

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

        // Find existing task with taskMaker populated
        const existingTask = await Task.findById(id).populate('taskMaker');
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

        // Year-based permission check (removed domain restriction)
        // Users can delete tasks created by their year or juniors, but not seniors
        // This applies across all domains
        if (!canDeleteTask(req.user, existingTask.taskMaker)) {
            return res.status(403).json({
                error: 'You can only delete tasks created by your year or juniors. Cannot delete tasks created by seniors.'
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

        // Find existing task with taskMaker populated
        const existingTask = await Task.findById(id).populate('taskMaker');
        if (!existingTask) {
            return res.status(404).json({
                error: 'Task not found'
            });
        }

        // Year-based permission check (removed domain restriction)
        // Users can delete tasks created by their year or juniors across all domains
        if (!canDeleteTask(req.user, existingTask.taskMaker)) {
            return res.status(403).json({
                error: 'You can only delete tasks created by your year or juniors. Cannot delete tasks created by seniors.'
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

        // Find all tasks with taskMaker populated
        const tasks = await Task.find({ _id: { $in: ids } }).populate('taskMaker');
        
        if (tasks.length === 0) {
            return res.status(404).json({
                error: 'No tasks found with provided IDs'
            });
        }

        // Check permissions for each task using year-based system (removed domain restriction)
        // Users can delete tasks created by their year or juniors across all domains
        const unauthorizedTasks = tasks.filter(task => {
            // Check year-based delete permission only
            if (!canDeleteTask(req.user, task.taskMaker)) return true;
            
            return false;
        });

        if (unauthorizedTasks.length > 0) {
            return res.status(403).json({
                error: 'You do not have permission to delete some tasks. You can only delete tasks created by your year or juniors.',
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
