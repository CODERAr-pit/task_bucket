import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { canEditTask, canUpdateTaskStatus } from "../utils/permissions.js";
import { canViewTask } from "../utils/visibility.js";

// Update existing task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { expand, fields } = req.query;
        const {
            title,
            description,
            taskMaker,
            assignedTo,
            domain,
            dueDate,
            status,
            priority,
            visibility
        } = req.body;

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
                error: 'Task not found or you do not have permission to update it'
            });
        }

        // Remove domain restriction - allow updates to tasks across all domains
        const userDomain = req.user.domain; // Keep for potential future use
        // if (existingTask.domain !== userDomain) {
        //     return res.status(403).json({
        //         error: 'You can only update tasks in your domain'
        //     });
        // }

        // Get existing task with populated user data for permission checks
        const taskWithUsers = await Task.findById(id)
            .populate('assignedTo', 'name email role')
            .populate('taskMaker', 'name email role');

        // Check permissions
        const isStatusOnlyUpdate = status !== undefined && 
            title === undefined && 
            description === undefined &&
            assignedTo === undefined &&
            domain === undefined &&
            dueDate === undefined &&
            priority === undefined &&
            taskMaker === undefined;

        if (isStatusOnlyUpdate) {
            // Status update: Check if user can update status
            if (!canUpdateTaskStatus(req.user, taskWithUsers.assignedTo, taskWithUsers.taskMaker)) {
                return res.status(403).json({
                    error: 'You can only update the status of tasks you are assigned to or created'
                });
            }
        } else {
            // Full edit: Check if user has senior permissions
            if (!canEditTask(req.user, taskWithUsers.assignedTo, taskWithUsers.taskMaker)) {
                return res.status(403).json({
                    error: 'You can only edit tasks where you are senior or equal to all assigned users and the task creator'
                });
            }
        }

        // Build update data (only include provided fields)
        const updateData = {};

        // Handle title
        if (title !== undefined) {
            if (!title || !title.trim()) {
                return res.status(400).json({
                    error: 'Title cannot be empty'
                });
            }
            updateData.title = title.trim();
        }

        // Handle description
        if (description !== undefined) {
            updateData.description = description;
        }

        // Handle taskMaker
        if (taskMaker !== undefined) {
            if (taskMaker) {
                const taskMakerUser = await User.findById(taskMaker);
                if (!taskMakerUser) {
                    return res.status(400).json({
                        error: 'Task maker not found'
                    });
                }
                // Remove domain restriction - allow cross-domain task makers
                // if (!taskMakerUser || taskMakerUser.domain !== userDomain) {
                //     return res.status(400).json({
                //         error: 'Task maker must be in the same domain'
                //     });
                // }
            }
            updateData.taskMaker = taskMaker;
        }

        // Handle assignedTo (multiple assignees)
        if (assignedTo !== undefined) {
            if (assignedTo && assignedTo.length > 0) {
                // Handle both single user ID and array of user IDs
                const assignedUsers = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
                
                for (const userId of assignedUsers) {
                    const assignedUser = await User.findById(userId);
                    if (!assignedUser) {
                        return res.status(400).json({
                            error: 'Assigned user not found'
                        });
                    }
                    // Remove domain restriction - allow cross-domain assignments
                    // if (!assignedUser || assignedUser.domain !== userDomain) {
                    //     return res.status(400).json({
                    //         error: 'All assigned users must be in the same domain'
                    //     });
                    // }
                }
                updateData.assignedTo = assignedUsers;
            } else {
                updateData.assignedTo = [];
            }
        }

        // Handle domain - allow setting to any domain
        if (domain !== undefined) {
            // Remove domain restriction - allow cross-domain task updates
            // if (domain !== userDomain) {
            //     return res.status(403).json({
            //         error: 'You can only set tasks to your domain'
            //     });
            // }
            updateData.domain = domain;
        }

        // Handle dueDate
        if (dueDate !== undefined) {
            if (dueDate && new Date(dueDate) <= new Date()) {
                return res.status(400).json({
                    error: 'Due date must be in the future'
                });
            }
            updateData.dueDate = dueDate;
        }

        // Handle status
        if (status !== undefined) {
            const validStatuses = ['todo', 'in-progress', 'completed', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    error: `Status must be one of: ${validStatuses.join(', ')}`
                });
            }
            updateData.status = status;
        }

        // Handle priority
        if (priority !== undefined) {
            const validPriorities = ['low', 'medium', 'high'];
            if (!validPriorities.includes(priority)) {
                return res.status(400).json({
                    error: `Priority must be one of: ${validPriorities.join(', ')}`
                });
            }
            updateData.priority = priority;
        }

        // Handle visibility
        if (visibility !== undefined) {
            const validVisibilities = ['public', 'private'];
            if (!validVisibilities.includes(visibility)) {
                return res.status(400).json({
                    error: `Visibility must be one of: ${validVisibilities.join(', ')}`
                });
            }
            updateData.visibility = visibility;
        }

        // Perform update
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Get updated task with populated fields
        let query = Task.findById(updatedTask._id);

        // Apply field selection
        if (fields) {
            const selectedFields = parseFields(fields);
            query = query.select(selectedFields);
        }

        // Always populate user names for better frontend experience
        query = query.populate('assignedTo', 'name email avatar role')
                     .populate('taskMaker', 'name email avatar role');

        // Apply expansion (populate relations)
        if (expand) {
            query = applyExpansion(query, expand);
        }

        const task = await query.exec();

        res.status(200).json({
            message: 'Task updated successfully',
            data: formatTaskResponse(task)
        });

    } catch (error) {
        console.error('Error in updateTask:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Handle cast errors (invalid ObjectId in relations)
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid ID format in request',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to update task',
            details: error.message
        });
    }
};

// Helper Functions
const parseFields = (fieldsString) => {
    if (fieldsString === '*') return '';
    
    return fieldsString.split(',').map(field => {
        field = field.trim();
        
        // Handle excerpt modifier
        if (field.includes(':excerpt')) {
            return field.split(':')[0];
        }
        
        return field;
    }).join(' ');
};

const applyExpansion = (query, expandString) => {
    const expandFields = expandString.split(',');
    
    expandFields.forEach(field => {
        field = field.trim();
        
        // Handle nested expansion
        if (field.includes('.')) {
            const [mainField, ...subFields] = field.split('.');
            query = query.populate({
                path: mainField,
                populate: {
                    path: subFields.join('.')
                }
            });
        } else {
            // Map to your actual schema fields
            switch (field) {
                case 'assignedTo':
                case 'assigned_to':
                    query = query.populate('assignedTo', 'name email avatar role');
                    break;
                case 'createdBy':
                case 'assigned_by':
                    query = query.populate('taskMaker', 'name email avatar role');
                    break;
                case 'domain':
                    query = query.populate('domain', 'name description');
                    break;
                default:
                    query = query.populate(field);
            }
        }
    });
    
    return query;
};

const formatTaskResponse = (task) => {
    if (!task) return null;
    
    const taskObj = task.toObject ? task.toObject() : task;
    
    // Handle assignedTo as an array
    let assignedTo = [];
    let assignedToName = [];
    
    if (taskObj.assignedTo) {
        if (Array.isArray(taskObj.assignedTo)) {
            assignedTo = taskObj.assignedTo.map(user => 
                user?._id?.toString() || user.toString()
            );
            assignedToName = taskObj.assignedTo.map(user => 
                user?.name || user
            ).filter(Boolean);
        } else {
            // Handle single assignee for backward compatibility
            assignedTo = [taskObj.assignedTo._id?.toString() || taskObj.assignedTo.toString()];
            assignedToName = [taskObj.assignedTo.name || taskObj.assignedTo];
        }
    }
    
    return {
        id: taskObj._id?.toString() || taskObj.id,
        title: taskObj.title,
        description: taskObj.description,
        status: taskObj.status || 'todo',
        priority: taskObj.priority || 'medium',
        visibility: taskObj.visibility || 'public',
        assignedTo: assignedTo,
        assignedToName: assignedToName,
        taskMaker: taskObj.taskMaker?._id?.toString() || taskObj.taskMaker,
        taskMakerName: taskObj.taskMaker?.name,
        domain: taskObj.domain,
        dueDate: taskObj.dueDate,
        createdAt: taskObj.createdAt,
        updatedAt: taskObj.updatedAt,
    };
};

export { updateTask };
