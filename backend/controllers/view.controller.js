import { Task } from "../models/Task.js";
import { canViewTask } from "../utils/visibility.js";

// View single task by ID
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        const { expand, fields } = req.query;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                error: 'Invalid task ID format'
            });
        }

        let query = Task.findById(id);
        
        // Security: User can only view tasks from their domain
        const userDomain = req.user.domain;
        query = query.where('domain').equals(userDomain);

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

        if (!task) {
            return res.status(404).json({
                error: 'Task not found or you do not have permission to view it'
            });
        }

        // Check if user can view this task based on visibility
        if (!canViewTask(task, req.user._id)) {
            return res.status(404).json({
                error: 'Task not found or you do not have permission to view it'
            });
        }

        res.status(200).json(formatTaskResponse(task));

    } catch (error) {
        console.error('Error in getTaskById:', error);
        res.status(500).json({
            error: 'Failed to fetch task',
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

// Format task response
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

export { getTaskById };
