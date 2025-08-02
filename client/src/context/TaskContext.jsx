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
    const location = useLocation();

    const domains = ['Web Development', 'Content Writing', 'Graphic Designing', 'Video Editing'];

    const domainMap = {
        'Web Development': 'WebD',
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
        if (domainFromRoute && domainFromRoute !== selectedDomain) {
            console.log('Auto-updating domain from route:', location.pathname, '->', domainFromRoute);
            setSelectedDomain(domainFromRoute);
        }
    }, [location.pathname, selectedDomain]);

    // Enhanced domain selection with filtering logic and optional navigation
    const selectDomainAndFilter = (domain, navigate = null) => {
        console.log('Selecting domain and applying filter:', domain);
        setSelectedDomain(domain);

        // Navigate to the corresponding route if navigate function is provided
        if (navigate) {
            const targetRoute = domainToRouteMap[domain];
            if (targetRoute && location.pathname !== targetRoute) {
                console.log('Navigating to:', targetRoute);
                navigate(targetRoute);
            }
        }

        // Trigger a filter update event
        window.dispatchEvent(new CustomEvent('domainChanged', {
            detail: { domain, timestamp: Date.now() }
        }));
    };

    // Get filtered tasks based on selected domain
    const getFilteredTasks = (allTasks = tasks) => {
        if (selectedDomain === 'General') {
            return allTasks;
        }

        const mappedDomain = domainMap[selectedDomain];
        return allTasks.filter(task => task.domain === mappedDomain);
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

    const value = {
        selectedDomain,
        setSelectedDomain,
        selectDomainAndFilter,
        domains,
        domainMap,
        tasks,
        setTasks,
        getFilteredTasks,
        getTaskCountForDomain,
        isDomainSelected,
        isCurrentDomainRoute,
        getDomainStats,
        routeToDomainMap,
        domainToRouteMap,
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};
