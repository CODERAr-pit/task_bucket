import React, { createContext, useContext, useState } from 'react';

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

    const domains = ['Web Development', 'Content Writing', 'Graphic Designing', 'Video Editing'];

    const domainMap = {
        'General': 'General',
        'Web Development': 'WebD',
        'Content Writing': 'Content Writing',
        'Graphic Designing': 'Graphic Designing',
        'Video Editing': 'Video Editing'
    };

    console.log('TaskProvider render - selectedDomain:', selectedDomain); // Debug log

    const value = {
        selectedDomain,
        setSelectedDomain,
        domains,
        domainMap
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};