import { Task } from "../models/Task.js";
import { addVisibilityFilter } from "../utils/visibility.js";

const getTaskList = async (req, res) => {
    try {
        const {
            page = 1,
            perPage = 30,
            sort = '-createdAt',
            filter,
            expand,
            fields,
            skipTotal = false
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = Math.min(parseInt(perPage), 100);
        const skip = (pageNum - 1) * limitNum;

        let query = Task.find();
        // Remove domain filtering - show all tasks to all users
        // const userDomain = req.user.domain;
        // query = query.where('domain').equals(userDomain);

        // Apply visibility filter - private tasks only visible to maker and assignees
        query = addVisibilityFilter(query, req.user._id);

        if (filter) {
            const mongoFilter = parseFilter(filter);
            if (mongoFilter) {
                query = query.where(mongoFilter);
            }
        }

        const sortOptions = parseSort(sort);
        query = query.sort(sortOptions);

        if (fields) {
            const selectedFields = parseFields(fields);
            query = query.select(selectedFields);
        }

        query = query.skip(skip).limit(limitNum);

        // Always populate user names for better frontend experience
        query = query.populate('assignedTo', 'name email avatar role')
                     .populate('taskMaker', 'name email avatar role');

        if (expand) {
            query = applyExpansion(query, expand);
        }

        const items = await query.exec();

        let totalItems = -1;
        let totalPages = -1;

        if (!skipTotal || skipTotal === 'false') {
            let countQuery = Task.find();
            // Remove domain filtering for count query too
            // countQuery = countQuery.where('domain').equals(userDomain);
            
            // Apply visibility filter for count query
            countQuery = addVisibilityFilter(countQuery, req.user._id);
            
            if (filter) {
                const mongoFilter = parseFilter(filter);
                if (mongoFilter) {
                    countQuery = countQuery.where(mongoFilter);
                }
            }
            
            totalItems = await countQuery.countDocuments();
            totalPages = Math.ceil(totalItems / limitNum);
        }

        const response = {
            page: pageNum,
            perPage: limitNum,
            totalPages,
            totalItems,
            items: items.map(task => formatTaskResponse(task))
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Error in getTasksList:', error);
        res.status(500).json({
            error: 'Failed to fetch tasks',
            details: error.message
        });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const { sort = '-createdAt', filter, expand, fields } = req.query;

        let query = Task.find();
        // Remove domain filtering - show all tasks to all users
        // const userDomain = req.user.domain;
        // query = query.where('domain').equals(userDomain);

        // Apply visibility filter - private tasks only visible to maker and assignees
        query = addVisibilityFilter(query, req.user._id);

        if (filter) {
            const mongoFilter = parseFilter(filter);
            if (mongoFilter) {
                query = query.where(mongoFilter);
            }
        }

        const sortOptions = parseSort(sort);
        query = query.sort(sortOptions);

        if (fields) {
            const selectedFields = parseFields(fields);
            query = query.select(selectedFields);
        }

        // Always populate user names for better frontend experience
        query = query.populate('assignedTo', 'name email avatar role')
                     .populate('taskMaker', 'name email avatar role');

        if (expand) {
            query = applyExpansion(query, expand);
        }

        const tasks = await query.exec();

        res.status(200).json(tasks.map(task => formatTaskResponse(task)));

    } catch (error) {
        console.error('Error in getAllTasks:', error);
        res.status(500).json({
            error: 'Failed to fetch all tasks',
            details: error.message
        });
    }
};

const getFirstTask = async (req, res) => {
    try {
        const { filter, expand, fields } = req.query;

        if (!filter) {
            return res.status(400).json({
                error: 'Filter parameter is required for getFirstListItem'
            });
        }

        let query = Task.findOne();
        // Remove domain filtering - show all tasks to all users
        // const userDomain = req.user.domain;
        // query = query.where('domain').equals(userDomain);

        const mongoFilter = parseFilter(filter);
        if (mongoFilter) {
            query = query.where(mongoFilter);
        }

        if (fields) {
            const selectedFields = parseFields(fields);
            query = query.select(selectedFields);
        }

        if (expand) {
            query = applyExpansion(query, expand);
        }

        const task = await query.exec();

        if (!task) {
            return res.status(404).json({
                error: 'No task found matching the criteria'
            });
        }

        res.status(200).json(formatTaskResponse(task));

    } catch (error) {
        console.error('Error in getFirstTask:', error);
        res.status(500).json({
            error: 'Failed to fetch task',
            details: error.message
        });
    }
};

// Helper Functions
const parseFilter = (filterString) => {
    try {
        const queryObject = {};
        
        const equalsMatches = filterString.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/g);
        if (equalsMatches) {
            equalsMatches.forEach(match => {
                const [, field, value] = match.match(/(\w+)\s*=\s*['"]([^'"]+)['"]/);
                queryObject[field] = value;
            });
        }
        
        const notEqualsMatches = filterString.match(/(\w+)\s*!=\s*['"]([^'"]+)['"]/g);
        if (notEqualsMatches) {
            notEqualsMatches.forEach(match => {
                const [, field, value] = match.match(/(\w+)\s*!=\s*['"]([^'"]+)['"]/);
                queryObject[field] = { $ne: value };
            });
        }
        
        return Object.keys(queryObject).length > 0 ? queryObject : null;
        
    } catch (error) {
        console.error('Error parsing filter:', error);
        return null;
    }
};

const parseSort = (sortString) => {
    const sortObj = {};
    
    if (!sortString) return { createdAt: -1 };

    const sortFields = sortString.split(',');
    
    sortFields.forEach(field => {
        field = field.trim();
        if (field.startsWith('-')) {
            sortObj[field.substring(1)] = -1;
        } else if (field.startsWith('+')) {
            sortObj[field.substring(1)] = 1;
        } else {
            sortObj[field] = 1;
        }
    });

    return sortObj;
};

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
                    query = query.populate('assignedTo', 'name email avatar');
                    break;
                case 'createdBy':
                case 'assigned_by':
                    query = query.populate('taskMaker', 'name email avatar');
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
    
    // Handle assignedTo as an array of IDs and names separately (for consistency with update controller)
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

export { getTaskList, getAllTasks, getFirstTask };
