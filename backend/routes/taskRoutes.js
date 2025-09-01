import express from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { authenticate, requireSenior, checkTaskAccess } from '../middleware/auth.js';
import { getTaskList } from '../controllers/search.controller.js';
import { getTaskById } from '../controllers/view.controller.js';
import { createTask } from '../controllers/create.controller.js';
import { updateTask } from '../controllers/update.controller.js';
import { deleteTask, bulkDeleteTasks } from '../controllers/delete.controller.js';
import { addComment, getComments } from '../controllers/comment.controller.js';

const router = express.Router();

// Add a comment to a task
router.post('/:taskId/comments', authenticate, addComment);

// Get all comments for a task
router.get('/:taskId/comments', authenticate, getComments);
import { subscribeToTaskChanges, subscribeToTaskById, getSSEInfo } from '../controllers/realtime.controller.js';
import { getUsersInDomain, getUsersFiltered, getFilterOptions } from '../controllers/users.controller.js';
import { getTaskPermissions } from '../controllers/permissions.controller.js';
import { 
    batchCreateTasks, 
    batchUpdateTasks, 
    batchUpsertTasks, 
    batchDeleteTasks 
} from '../controllers/batch.controller.js';

// ...existing code...

// GET ALL USERS (for individual selection mode)
router.get('/users', authenticate, getUsersInDomain);

// GET FILTERED USERS (for domain-specific assignment)
router.get('/users/filtered', authenticate, getUsersFiltered);

// GET FILTER OPTIONS (domains, roles, combinations) - temp without auth for testing
router.get('/users/filter-options', getFilterOptions);

// LIST/SEARCH TASKS
router.get('/', authenticate, getTaskList);

// VIEW SINGLE TASK
router.get('/:id', authenticate, getTaskById);

// GET TASK PERMISSIONS
router.get('/:id/permissions', authenticate, getTaskPermissions);

// CREATE NEW TASK
router.post('/', authenticate, createTask);

// UPDATE TASK
router.put('/:id', authenticate, updateTask);

// DELETE TASK
router.delete('/:id', authenticate, deleteTask);

// REALTIME ENDPOINTS
router.get('/realtime/info', authenticate, getSSEInfo);
router.get('/realtime', authenticate, subscribeToTaskChanges);
router.get('/realtime/:id', authenticate, subscribeToTaskById);

// BATCH OPERATIONS
router.post('/batch/create', authenticate, batchCreateTasks);
router.put('/batch/update', authenticate, batchUpdateTasks);
router.post('/batch/upsert', authenticate, batchUpsertTasks);
router.delete('/batch/delete', authenticate, batchDeleteTasks);

// BULK DELETE (alternative endpoint)
router.post('/bulk-delete', authenticate, bulkDeleteTasks);
//     try {
//         const task = await Task.findById(req.params.id)
//             .populate('taskMaker', 'name email role')
//             .populate('assignedTo', 'name email role');

//         res.json({
//             success: true,
//             task
//         });

//     } catch (error) {
//         console.error('Get task error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching task'
//         });
// }

// // Create new task (seniors only)
// router.post('/', authenticate, requireSenior, async (req, res) => {
//     try {
//         const { title, description, assignedTo, domain, dueDate, priority } = req.body;

//         // Validation
//         if (!title || !description || !assignedTo || !dueDate) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Title, description, assignedTo, and dueDate are required'
//             });
//         }

//         // Check if assigned user exists and is in same domain
//         const assignedUser = await User.findById(assignedTo);
//         if (!assignedUser) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Assigned user not found'
//             });
//         }

//         const taskDomain = domain || req.user.domain;
//         if (assignedUser.domain !== taskDomain) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Cannot assign task to user from different domain'
//             });
//         }

//         // Create task
//         const task = new Task({
//             title,
//             description,
//             taskMaker: req.user._id,
//             assignedTo,
//             domain: taskDomain,
//             dueDate: new Date(dueDate),
//             priority: priority || 'medium'
//         });

//         await task.save();

//         const populatedTask = await Task.findById(task._id)
//             .populate('taskMaker', 'name email')
//             .populate('assignedTo', 'name email');

//         res.status(201).json({
//             success: true,
//             message: 'Task created successfully',
//             task: populatedTask
//         });

//     } catch (error) {
//         console.error('Create task error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error creating task'
//         });
//     }
// });

// // Update task status (assignees can update status, creators can update everything)
// router.patch('/:id', authenticate, checkTaskAccess, async (req, res) => {
//     try {
//         const { status, title, description, dueDate, priority } = req.body;
//         const task = req.task;

//         // Check permissions
//         const isTaskCreator = task.taskMaker.toString() === req.user._id.toString();
//         const isAssignee = task.assignedTo.toString() === req.user._id.toString();

//         if (!isTaskCreator && !isAssignee) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You can only update tasks assigned to you or created by you'
//             });
//         }

//         // Update fields based on permissions
//         if (isAssignee && !isTaskCreator) {
//             // Assignees can only update status
//             if (status) task.status = status;
//         } else if (isTaskCreator) {
//             // Creators can update everything
//             if (title) task.title = title;
//             if (description) task.description = description;
//             if (status) task.status = status;
//             if (dueDate) task.dueDate = new Date(dueDate);
//             if (priority) task.priority = priority;
//         }

//         await task.save();

//         const updatedTask = await Task.findById(task._id)
//             .populate('taskMaker', 'name email')
//             .populate('assignedTo', 'name email');

//         res.json({
//             success: true,
//             message: 'Task updated successfully',
//             task: updatedTask
//         });

//     } catch (error) {
//         console.error('Update task error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error updating task'
//         });
//     }
// });

// // Delete task (creators only)
// router.delete('/:id', authenticate, checkTaskAccess, async (req, res) => {
//     try {
//         const task = req.task;

//         // Only task creator can delete
//         if (task.taskMaker.toString() !== req.user._id.toString()) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'Only task creator can delete the task'
//             });
//         }

//         await Task.findByIdAndDelete(task._id);

//         res.json({
//             success: true,
//             message: 'Task deleted successfully'
//         });

//     } catch (error) {
//         console.error('Delete task error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error deleting task'
//         });
//     }
// });

// // Get tasks assigned to current user
// router.get('/assigned/me', authenticate, async (req, res) => {
//     try {
//         const tasks = await Task.find({ assignedTo: req.user._id })
//             .populate('taskMaker', 'name email')
//             .sort({ createdAt: -1 });

//         res.json({
//             success: true,
//             tasks
//         });

//     } catch (error) {
//         console.error('Get assigned tasks error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching assigned tasks'
//         });
//     }
// });

// // Get tasks created by current user
// router.get('/created/me', authenticate, async (req, res) => {
//     try {
//         const tasks = await Task.find({ taskMaker: req.user._id })
//             .populate('assignedTo', 'name email')
//             .sort({ createdAt: -1 });

//         res.json({
//             success: true,
//             tasks
//         });

//     } catch (error) {
//         console.error('Get created tasks error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Error fetching created tasks'
//         });
//     }
// });

export default router;
