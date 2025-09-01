import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router';

const TaskContext = createContext();

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};

export const TaskProvider = ({ children }) => {
    const [selectedDomain, setSelectedDomain] = useState('General');
    const [tasks, setTasks] = useState([]);
        const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const location = useLocation();

    const domains = ['Web Development', 'Content Writing', 'Graphic Designing', 'Video Editing'];

    const domainMap = {
        'Web Development': 'Web Development',
        'Content Writing': 'Content Writing',
        'Graphic Designing': 'Graphic Designing',
        'Video Editing': 'Video Editing'
    };

    // Route to domain mapping
    const routeToDomainMap = {
        '/dashboard': 'General',
        '/': 'General',
        '/dashboard/web-development': 'Web Development',
        '/dashboard/content-writing': 'Content Writing',
        '/dashboard/graphic-designing': 'Graphic Designing',
        '/dashboard/video-editing': 'Video Editing'
    };

    // Domain to route mapping (for navigation)
    const domainToRouteMap = {
        'General': '/dashboard',
        'Web Development': '/dashboard/web-development',
        'Content Writing': '/dashboard/content-writing',
        'Graphic Designing': '/dashboard/graphic-designing',
        'Video Editing': '/dashboard/video-editing'
    };

    // Auto-update domain based on route
    useEffect(() => {
        const domainFromRoute = routeToDomainMap[location.pathname];
        if (domainFromRoute && domainFromRoute !== selectedDomain && !selectedDomain.startsWith('filter:')) {
            setSelectedDomain(domainFromRoute);
        }
    }, [location.pathname, selectedDomain]);

    // Enhanced domain selection with filtering logic and optional navigation
    const selectDomainAndFilter = (domain, navigate = null) => {
        setSelectedDomain(domain);

        // Navigate to the corresponding route if navigate function is provided
        if (navigate) {
            const targetRoute = domainToRouteMap[domain];
            if (targetRoute && location.pathname !== targetRoute) {
                navigate(targetRoute);
            }
        }

        // Trigger a filter update event
        window.dispatchEvent(new CustomEvent('domainChanged', {
            detail: { domain, timestamp: Date.now() }
        }));
    };

    // Get filtered tasks based on selected domain or filter
    const getFilteredTasks = (allTasks = tasks) => {
        // Handle special filter types
        if (selectedDomain.startsWith('filter:')) {
            const filterType = selectedDomain.replace('filter:', '');
            const currentUser = getCurrentUser();
            
            if (filterType === 'assigned') {
                const filtered = allTasks.filter(task => {
                    // Check if current user ID is in the assignedTo array
                    if (Array.isArray(task.assignedTo)) {
                        return task.assignedTo.includes(currentUser._id) || 
                               task.assignedTo.includes(currentUser.id);
                    }
                    // Handle single assignee case
                    return task.assignedTo === currentUser._id || 
                           task.assignedTo === currentUser.id;
                });
                return filtered;
                
            } else if (filterType === 'created') {
                const filtered = allTasks.filter(task => {
                    // Check if current user created the task
                    return task.taskMaker === currentUser._id || 
                           task.taskMaker === currentUser.id;
                });
                return filtered;
            }
        }
        
        // Handle regular domain filtering
        if (selectedDomain === 'General') {
            return allTasks;
        }

        const mappedDomain = domainMap[selectedDomain];
        return allTasks.filter(task => task.domain === mappedDomain);
    };

    // Get current user data
    const getCurrentUser = () => {
        try {
            const userData = localStorage.getItem('userData');
            const user = userData ? JSON.parse(userData) : { _id: null, email: null };
            return user;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return { _id: null, email: null };
        }
    };

    // Get task count for a specific domain
    const getTaskCountForDomain = (domain, allTasks = tasks) => {
        if (domain === 'General') {
            return allTasks.length;
        }

        const mappedDomain = domainMap[domain];
        return allTasks.filter(task => task.domain === mappedDomain).length;
    };

    // Check if a domain is currently selected
    const isDomainSelected = (domain) => {
        return selectedDomain === domain;
    };

    // Check if current route matches a domain
    const isCurrentDomainRoute = (domain) => {
        const expectedRoute = domainToRouteMap[domain];
        return location.pathname === expectedRoute;
    };

    // Get all domain stats
    const getDomainStats = (allTasks = tasks) => {
        const stats = { General: allTasks.length };

        domains.forEach(domain => {
            const mappedDomain = domainMap[domain];
            stats[domain] = allTasks.filter(task => task.domain === mappedDomain).length;
        });

        return stats;
    };
        // Helper function to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    };

    // API Functions
    const fetchTasks = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const url = queryString 
                ? `${apiUrl}/api/tasks?${queryString}` 
                : `${apiUrl}/api/tasks`;

            const response = await fetch(url, {
                credentials: 'include',
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch tasks: ${response.status}`);
            }
            
            const data = await response.json();
            const tasksArray = data.items || data.tasks || data;
            setTasks(tasksArray);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching tasks:', err);
        } finally {
            setLoading(false);
        }
    };

    const createTask = async (taskData) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/tasks`, {
                method: 'POST',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify(taskData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to create task: ${response.status}`);
            }
            
            const result = await response.json();
            const newTask = result.data || result; // Backend returns {message, data}
            setTasks(prev => [...prev, newTask]);
            return newTask;
        } catch (err) {
            setError(err.message);
            console.error('Error creating task:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateTask = async (id, taskData) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: getAuthHeaders(),
                body: JSON.stringify(taskData),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('TaskContext: Update failed:', errorData);
                throw new Error(errorData.error || `Failed to update task: ${response.status}`);
            }
            
            const result = await response.json();
            const updatedTask = result.data || result; // Backend returns {message, data}
            setTasks(prev => prev.map(task => (task.id === id || task._id === id) ? updatedTask : task));
            return updatedTask;
        } catch (err) {
            setError(err.message);
            console.error('Error updating task:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteTask = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/tasks/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: getAuthHeaders(),
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete task: ${response.status}`);
            }
            
            setTasks(prev => prev.filter(task => task.id !== id && task._id !== id));
            return true;
        } catch (err) {
            setError(err.message);
            console.error('Error deleting task:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchTasks();
    }, []);

    const value = {
        selectedDomain,
        setSelectedDomain,
        selectDomainAndFilter,
        domains,
        domainMap,
        tasks,
        setTasks,
           fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        loading,
error,
        getFilteredTasks,
        getTaskCountForDomain,
        isDomainSelected,
        isCurrentDomainRoute,
        getDomainStats,
        routeToDomainMap,
        domainToRouteMap,
        getCurrentUser,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};
