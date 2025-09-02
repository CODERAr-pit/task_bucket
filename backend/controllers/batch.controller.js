import { Task } from "../models/Task.js";
import mongoose from "mongoose";
import { addVisibilityFilter } from "../utils/visibility.js";
import { canDeleteTask } from "../utils/permissions.js";

// Batch create tasks
const batchCreateTasks = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();

        const { tasks } = req.body;

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of tasks to create'
            });
        }

        if (tasks.length > 100) {
            return res.status(400).json({
                error: 'Maximum 100 tasks can be created at once'
            });
        }

        const userDomain = req.user.domain;
        const userId = req.user._id;

        // Validate and prepare tasks
        const tasksToCreate = tasks.map((taskData, index) => {
            // Basic validation
            if (!taskData.title || !taskData.assignedTo) {
                throw new Error(`Task at index ${index}: title and assignedTo are required`);
            }

            // Set domain and task maker
            return {
                ...taskData,
                domain: userDomain,
                taskMaker: userId,
                status: taskData.status || 'pending'
            };
        });

        // Create all tasks
        const createdTasks = await Task.insertMany(tasksToCreate, { session });

        // Populate the created tasks with user data
        const populatedTasks = await Task.populate(createdTasks, [
            { path: 'taskMaker', select: 'name email role' },
            { path: 'assignedTo', select: 'name email role' }
        ]);

        await session.commitTransaction();

        res.status(201).json({
            message: `${createdTasks.length} tasks created successfully`,
            data: populatedTasks
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in batchCreateTasks:', error);
        res.status(400).json({
            error: 'Failed to create tasks',
            details: error.message
        });
    } finally {
        await session.endSession();
    }
};

// Batch update tasks
const batchUpdateTasks = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();

        const { updates } = req.body;

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of task updates'
            });
        }

        if (updates.length > 100) {
            return res.status(400).json({
                error: 'Maximum 100 tasks can be updated at once'
            });
        }

        const userDomain = req.user.domain;
        const userId = req.user._id.toString();
        const isSenior = req.user.role === 'senior';

        const updateResults = [];
        const errors = [];

        for (let i = 0; i < updates.length; i++) {
            const updateData = updates[i];
            
            try {
                if (!updateData.id) {
                    throw new Error('Task ID is required');
                }

                // Validate ObjectId format
                if (!updateData.id.match(/^[0-9a-fA-F]{24}$/)) {
                    throw new Error('Invalid task ID format');
                }

                // Find existing task
                const existingTask = await Task.findById(updateData.id).session(session);
                if (!existingTask) {
                    throw new Error('Task not found');
                }

                // Security checks
                if (existingTask.domain !== userDomain) {
                    throw new Error('You can only update tasks in your domain');
                }

                // Permission checks
                const isTaskCreator = existingTask.taskMaker && existingTask.taskMaker.toString() === userId;
                const isAssignedUser = existingTask.assignedTo && existingTask.assignedTo.toString() === userId;

                if (!isTaskCreator && !isAssignedUser && !isSenior) {
                    throw new Error('You do not have permission to update this task');
                }

                // Prepare update data
                const updateFields = { ...updateData };
                delete updateFields.id;
                delete updateFields.domain; // Don't allow domain changes
                delete updateFields.taskMaker; // Don't allow task maker changes

                // Update task
                const updatedTask = await Task.findByIdAndUpdate(
                    updateData.id,
                    updateFields,
                    { 
                        new: true,
                        runValidators: true,
                        session
                    }
                ).populate('taskMaker', 'name email role')
                 .populate('assignedTo', 'name email role');

                updateResults.push({
                    id: updateData.id,
                    success: true,
                    data: updatedTask
                });

            } catch (error) {
                errors.push({
                    index: i,
                    id: updateData.id,
                    error: error.message
                });
            }
        }

        if (errors.length > 0 && updateResults.length === 0) {
            // All updates failed
            await session.abortTransaction();
            return res.status(400).json({
                error: 'All updates failed',
                errors
            });
        }

        await session.commitTransaction();

        res.status(200).json({
            message: `${updateResults.length} tasks updated successfully`,
            data: updateResults,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in batchUpdateTasks:', error);
        res.status(500).json({
            error: 'Failed to update tasks',
            details: error.message
        });
    } finally {
        await session.endSession();
    }
};

// Batch upsert tasks (create if not exists, update if exists)
const batchUpsertTasks = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();

        const { tasks } = req.body;

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of tasks to upsert'
            });
        }

        if (tasks.length > 100) {
            return res.status(400).json({
                error: 'Maximum 100 tasks can be processed at once'
            });
        }

        const userDomain = req.user.domain;
        const userId = req.user._id;
        
        const results = [];
        const errors = [];

        for (let i = 0; i < tasks.length; i++) {
            const taskData = tasks[i];
            
            try {
                if (!taskData.title) {
                    throw new Error('Task title is required');
                }

                let task;
                let operation = 'created';

                if (taskData._id || taskData.id) {
                    // Update existing task
                    const taskId = taskData._id || taskData.id;
                    
                    if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
                        throw new Error('Invalid task ID format');
                    }

                    const updateData = { ...taskData };
                    delete updateData._id;
                    delete updateData.id;
                    delete updateData.domain;
                    delete updateData.taskMaker;

                    task = await Task.findByIdAndUpdate(
                        taskId,
                        updateData,
                        { 
                            new: true,
                            runValidators: true,
                            session
                        }
                    ).populate('taskMaker', 'name email role')
                     .populate('assignedTo', 'name email role');

                    if (!task) {
                        throw new Error('Task not found for update');
                    }

                    operation = 'updated';
                } else {
                    // Create new task
                    if (!taskData.assignedTo) {
                        throw new Error('assignedTo is required for new tasks');
                    }

                    const newTaskData = {
                        ...taskData,
                        domain: userDomain,
                        taskMaker: userId,
                        status: taskData.status || 'pending'
                    };

                    task = await Task.create([newTaskData], { session });
                    task = await Task.populate(task[0], [
                        { path: 'taskMaker', select: 'name email role' },
                        { path: 'assignedTo', select: 'name email role' }
                    ]);
                }

                results.push({
                    operation,
                    success: true,
                    data: task
                });

            } catch (error) {
                errors.push({
                    index: i,
                    error: error.message
                });
            }
        }

        if (errors.length > 0 && results.length === 0) {
            // All operations failed
            await session.abortTransaction();
            return res.status(400).json({
                error: 'All operations failed',
                errors
            });
        }

        await session.commitTransaction();

        const createdCount = results.filter(r => r.operation === 'created').length;
        const updatedCount = results.filter(r => r.operation === 'updated').length;

        res.status(200).json({
            message: `Batch upsert completed: ${createdCount} created, ${updatedCount} updated`,
            data: results,
            summary: {
                created: createdCount,
                updated: updatedCount,
                errors: errors.length
            },
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in batchUpsertTasks:', error);
        res.status(500).json({
            error: 'Failed to upsert tasks',
            details: error.message
        });
    } finally {
        await session.endSession();
    }
};

// Batch delete tasks
const batchDeleteTasks = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        await session.startTransaction();

        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                error: 'Please provide an array of task IDs to delete'
            });
        }

        if (ids.length > 100) {
            return res.status(400).json({
                error: 'Maximum 100 tasks can be deleted at once'
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

        // Find all tasks with visibility filter and populate taskMaker
        let query = Task.find({ _id: { $in: ids } }).populate('taskMaker');
        query = addVisibilityFilter(query, req.user._id);
        const tasks = await query.session(session).exec();
        
        if (tasks.length === 0) {
            return res.status(404).json({
                error: 'No tasks found with provided IDs'
            });
        }

        // Check permissions using year-based system (removed domain restriction)
        // Users can delete tasks created by their year or juniors across all domains
        const unauthorizedTasks = tasks.filter(task => {
            // Check year-based delete permission only
            if (!canDeleteTask(req.user, task.taskMaker)) return true;
            
            return false;
        });

        if (unauthorizedTasks.length > 0) {
            await session.abortTransaction();
            return res.status(403).json({
                error: 'You do not have permission to delete some tasks. You can only delete tasks created by your year or juniors.',
                unauthorizedTaskIds: unauthorizedTasks.map(task => task._id)
            });
        }

        // Delete all authorized tasks
        const result = await Task.deleteMany({ _id: { $in: ids } }, { session });

        await session.commitTransaction();

        res.status(200).json({
            message: `${result.deletedCount} tasks deleted successfully`,
            data: {
                deletedCount: result.deletedCount,
                requestedCount: ids.length
            }
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in batchDeleteTasks:', error);
        res.status(500).json({
            error: 'Failed to delete tasks',
            details: error.message
        });
    } finally {
        await session.endSession();
    }
};

export { 
    batchCreateTasks, 
    batchUpdateTasks, 
    batchUpsertTasks, 
    batchDeleteTasks 
};
