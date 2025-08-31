import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { sendTaskAssignmentEmail } from "../services/emailService.js";

// Create new task
const createTask = async (req, res) => {
    try {
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
            visibility = 'public'
        } = req.body;

        // Validation
        if (!title || !title.trim()) {
            return res.status(400).json({
                error: 'Title is required'
            });
        }

        // Allow creating tasks in any domain
        const userDomain = req.user.domain;
        const taskDomain = domain || userDomain;

        // Remove domain restriction - allow cross-domain task creation
        // if (taskDomain !== userDomain) {
        //     return res.status(403).json({
        //         error: 'You can only create tasks in your domain'
        //     });
        // }

        // Validate assigned users exist (remove domain requirement)
        if (assignedTo) {
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
        }

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

        // Create task data
        const taskData = {
            title: title.trim(),
            description: description?.trim() || '',
            assignedTo: assignedTo ? (Array.isArray(assignedTo) ? assignedTo : [assignedTo]) : [],
            taskMaker: taskMaker || req.user._id, // Default to current user
            domain: taskDomain,
            dueDate: dueDate ? new Date(dueDate) : null,
            status: status || 'todo',
            priority: priority || 'medium',
            visibility: visibility || 'public'
        };

        // Validate status and priority
        const validStatuses = ['todo', 'in-progress', 'completed', 'overdue'];
        const validPriorities = ['low', 'medium', 'high'];
        const validVisibilities = ['public', 'private'];

        if (!validStatuses.includes(taskData.status)) {
            return res.status(400).json({
                error: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        if (!validPriorities.includes(taskData.priority)) {
            return res.status(400).json({
                error: `Priority must be one of: ${validPriorities.join(', ')}`
            });
        }

        if (!validVisibilities.includes(taskData.visibility)) {
            return res.status(400).json({
                error: `Visibility must be one of: ${validVisibilities.join(', ')}`
            });
        }

        // Create the task
        const newTask = new Task(taskData);
        await newTask.save();

        // Build query for returning the created task
        let query = Task.findById(newTask._id);

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

        // Send assignment notifications
        if (taskData.assignedTo && taskData.assignedTo.length > 0) {
            try {
                const assignedUsers = await User.find({ _id: { $in: taskData.assignedTo } });
                const taskMaker = await User.findById(taskData.taskMaker);
                
                console.log(`Sending task assignment emails to ${assignedUsers.length} users...`);
                
                for (const assignedUser of assignedUsers) {
                    try {
                        await sendTaskAssignmentEmail(
                            assignedUser.email,
                            assignedUser.name,
                            taskData.title,
                            taskData.description,
                            taskData.dueDate,
                            taskMaker ? taskMaker.name : 'System'
                        );
                        console.log(`Assignment email sent to: ${assignedUser.email}`);
                    } catch (emailError) {
                        console.error(`Failed to send assignment email to ${assignedUser.email}:`, emailError);
                    }
                }
                
                // Mark notifications as sent
                await Task.findByIdAndUpdate(newTask._id, {
                    'notifications.assigned': true
                });
                
                console.log('Task assignment notifications completed');
            } catch (emailError) {
                console.error('Error in task assignment notification process:', emailError);
                // Don't fail task creation if emails fail
            }
        }

        res.status(201).json({
            message: 'Task created successfully',
            data: formatTaskResponse(task)
        });

    } catch (error) {
        console.error('Error in createTask:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                error: 'Validation failed',
                details: validationErrors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Task with this data already exists',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Failed to create task',
            details: error.message
        });
    }
};

// Helper Functions
const parseFields = (fieldsString) => {
    if (fieldsString === '*') return '';
    
    return fieldsString.split(',').map(field => {
        field = field.trim();
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
        
        if (field.includes('.')) {
            const [mainField, ...subFields] = field.split('.');
            query = query.populate({
                path: mainField,
                populate: {
                    path: subFields.join('.')
                }
            });
        } else {
            switch (field) {
                case 'assignedTo':
                case 'assigned_to':
                    query = query.populate('assignedTo', 'name email avatar role');
                    break;
                case 'taskMaker':
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

export { createTask };
