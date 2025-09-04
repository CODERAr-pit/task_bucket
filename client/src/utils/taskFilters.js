// Utility functions for task filtering and sorting

/**
 * Check if a task is overdue
 */
export const isTaskOverdue = (task) => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
};

/**
 * Check if a task is due today
 */
export const isTaskDueToday = (task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return (
        dueDate.getDate() === today.getDate() &&
        dueDate.getMonth() === today.getMonth() &&
        dueDate.getFullYear() === today.getFullYear()
    );
};

/**
 * Check if a task is due this week
 */
export const isTaskDueThisWeek = (task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return dueDate >= startOfWeek && dueDate <= endOfWeek;
};

/**
 * Get priority order for sorting
 */
export const getPriorityOrder = (priority) => {
    const priorityMap = { 'high': 3, 'medium': 2, 'low': 1 };
    return priorityMap[priority?.toLowerCase()] || 0;
};

/**
 * Get status order for sorting
 */
export const getStatusOrder = (status) => {
    const statusMap = { 'todo': 1, 'in-progress': 2, 'completed': 3 };
    return statusMap[status?.toLowerCase()] || 0;
};

/**
 * Filter tasks based on filter criteria
 */
export const filterTasks = (tasks, filters) => {
    return tasks.filter(task => {
        // Status filter
        if (filters.status !== 'all') {
            if (task.status?.toLowerCase() !== filters.status.toLowerCase()) {
                return false;
            }
        }

        // Priority filter
        if (filters.priority !== 'all') {
            if (task.priority?.toLowerCase() !== filters.priority.toLowerCase()) {
                return false;
            }
        }

        // Overdue/Due date filter
        if (filters.overdue !== 'all') {
            switch (filters.overdue) {
                case 'overdue':
                    if (!isTaskOverdue(task)) return false;
                    break;
                case 'due-today':
                    if (!isTaskDueToday(task)) return false;
                    break;
                case 'due-this-week':
                    if (!isTaskDueThisWeek(task)) return false;
                    break;
                case 'upcoming':
                    if (isTaskOverdue(task) || isTaskDueToday(task) || task.status === 'completed') return false;
                    break;
                default:
                    break;
            }
        }

        return true;
    });
};

/**
 * Sort tasks based on sort criteria
 */
export const sortTasks = (tasks, sortBy, sortOrder = 'asc') => {
    const sortedTasks = [...tasks].sort((a, b) => {
        let compareValue = 0;

        switch (sortBy) {
            case 'dueDate':
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                compareValue = dateA - dateB;
                break;

            case 'createdAt':
                const createdA = new Date(a.createdAt || a.dateCreated || 0);
                const createdB = new Date(b.createdAt || b.dateCreated || 0);
                compareValue = createdA - createdB;
                break;

            case 'priority':
                compareValue = getPriorityOrder(b.priority) - getPriorityOrder(a.priority);
                break;

            case 'status':
                compareValue = getStatusOrder(a.status) - getStatusOrder(b.status);
                break;

            default:
                compareValue = 0;
        }

        return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sortedTasks;
};

/**
 * Get task counts by status for filter display
 */
export const getTaskCounts = (tasks) => {
    const counts = {
        all: tasks.length,
        todo: 0,
        inProgress: 0,
        completed: 0
    };

    tasks.forEach(task => {
        const status = task.status?.toLowerCase();
        if (status === 'todo') {
            counts.todo++;
        } else if (status === 'in-progress') {
            counts.inProgress++;
        } else if (status === 'completed') {
            counts.completed++;
        }
    });

    return counts;
};
