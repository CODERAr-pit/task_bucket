import React, { useEffect, useState } from 'react';
import TaskCard from "../ui/card.jsx";
import Navbar from "../ui/Navbar.jsx";
import TaskDetailsModal from "./TaskDetailsModal.jsx";
import EditTaskModal from "./EditTaskModal.jsx";
import { useTaskContext } from "../context/TaskContext";
import { Plus, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchTaskPermissions } from '../utils/permissions';
import Footer from "./Footer.jsx";

const Dashboard = () => {
    const {
        selectedDomain,
        tasks,
        loading,
        error,
        fetchTasks,
        updateTask,
        deleteTask,
        getFilteredTasks,
        getCurrentUser
    } = useTaskContext();

    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskPermissions, setTaskPermissions] = useState(null);
    const [selectedTaskPermissions, setSelectedTaskPermissions] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleViewDetails = async (task) => {
        try {
            const taskId = task._id || task.id;
            if (!taskId) {
                alert('Task ID not found. Please refresh the page and try again.');
                return;
            }
            const permissions = await fetchTaskPermissions(taskId);
            setSelectedTask(task);
            setSelectedTaskPermissions(permissions);
            setShowTaskDetails(true);
        } catch (err) {
            console.error('Error fetching task permissions for details:', err);
            // Still show the modal but with limited permissions
            setSelectedTask(task);
            setSelectedTaskPermissions({ canEdit: false, canUpdateStatus: true, canDelete: false });
            setShowTaskDetails(true);
        }
    };

    const handleEditTask = async (task) => {
        try {
            const taskId = task._id || task.id;
            if (!taskId) {
                alert('Task ID not found. Please refresh the page and try again.');
                return;
            }
            const permissions = await fetchTaskPermissions(taskId);
            setEditingTask(task);
            setTaskPermissions(permissions);
            setShowEditModal(true);
            setShowTaskDetails(false);
        } catch (err) {
            console.error('Error fetching task permissions:', err);
            setEditingTask(task);
            setTaskPermissions({ canEdit: false, canUpdateStatus: true });
            setShowEditModal(true);
            setShowTaskDetails(false);
        }
    };

    const handleUpdateTask = async (taskId, updateData) => {
        try {
            await updateTask(taskId, updateData);
            await fetchTasks();
            setShowEditModal(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Error updating task:', err);
            alert('Failed to update task: ' + (err.message || 'Unknown error'));
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to permanently delete this task?')) {
            try {
                await deleteTask(taskId);
                await fetchTasks();
                setShowTaskDetails(false);
            } catch (err) {
                console.error('Error deleting task:', err);
                alert('Failed to delete task. Please try again.');
            }
        }
    };

    const getDisplayTitle = () => {
        if (selectedDomain.startsWith('filter:')) {
            const filterType = selectedDomain.replace('filter:', '');
            if (filterType === 'assigned') return 'My Tasks';
            if (filterType === 'created') return 'Created By Me';
        }
        return selectedDomain === 'General' ? 'All Tasks' : `${selectedDomain} Tasks`;
    };

    const filteredTasks = getFilteredTasks(tasks);

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <Navbar />

            <main className="w-full max-w-[1800px] mx-auto px-4 py-10 sm:px-6 lg:px-8 flex-grow">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-24">
                        <div className="w-8 h-8 mx-auto border-4 border-border border-t-primary rounded-full animate-spin"></div>
                        <p className="mt-4 text-text-secondary font-medium">Loading tasks...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-900/40 border border-red-800/50 text-red-300 p-4 rounded-xl max-w-2xl mx-auto my-12">
                        <h3 className="font-bold">Something went wrong</h3>
                        <p className="text-sm mt-1">{error}</p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* Header Section */}
                        <header className="mb-10 flex flex-row justify-between items-center gap-6 px-4 sm:px-0">
                            <div>
                                <h1 className="text-2xl md:text-4xl font-bold text-text-primary tracking-tighter">
                                    {getDisplayTitle()}
                                </h1>
                                <p className="text-text-secondary text-sm mt-1">
                                    Showing {filteredTasks.length} of {tasks.length} tasks.
                                </p>
                            </div>
                            <Link to="/tasks">
                                <button className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-full transition-transform duration-200 hover:-translate-y-0.5 whitespace-nowrap">
                                    <Plus size={18} className="mr-2" />
                                    Create Task
                                </button>
                            </Link>
                        </header>

                        {/* Tasks Grid */}
                        {filteredTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredTasks.map(task => (
                                    <TaskCard
                                        key={task._id || task.id}
                                        task={task}
                                        onViewDetails={handleViewDetails}
                                        onUpdate={handleUpdateTask}
                                        onDelete={handleDeleteTask}
                                    />
                                ))}
                            </div>
                        ) : (
                            // Empty State
                            <div className="text-center flex flex-col justify-center items-center py-20 border-2 border-dashed border-border rounded-2xl">
                                <Inbox className="w-14 h-14 text-border mx-auto mb-5" />
                                <h3 className="text-text-primary text-xl font-bold mb-2">
                                    It's quiet in here
                                </h3>
                                <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto">
                                    There are no tasks to show for this view. Create a new one to get started.
                                </p>
                                <Link to="/tasks">
                                    <button className="flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-5 rounded-full transition-transform duration-200 hover:-translate-y-0.5">
                                        <Plus size={18} className="mr-2" />
                                        Create First Task
                                    </button>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </main>

            <Footer />

            {/* Modals */}
            <TaskDetailsModal 
                isOpen={showTaskDetails} 
                onClose={() => {
                    setSelectedTask(null);
                    setSelectedTaskPermissions(null);
                    setShowTaskDetails(false);
                }} 
                currentUser={getCurrentUser()} 
                task={selectedTask} 
                permissions={selectedTaskPermissions}
                onUpdate={handleEditTask} 
                onDelete={handleDeleteTask} 
            />
            <EditTaskModal 
                isOpen={showEditModal} 
                onClose={() => {
                    setEditingTask(null);
                    setShowEditModal(false);
                }} 
                task={editingTask} 
                permissions={taskPermissions} 
                onUpdate={handleUpdateTask}
            />
        </div>
    );
};

export default Dashboard;