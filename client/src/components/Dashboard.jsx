import React, { useEffect, useState } from 'react';
import TaskCard from "../ui/card.jsx";
import Navbar from "../ui/Navbar.jsx";
import TaskDetailsModal from "./TaskDetailsModal.jsx";
import EditTaskModal from "./EditTaskModal.jsx";
import {useTaskContext} from "../context/TaskContext";
import {Plus} from "lucide-react";
import {Link} from "react-router";
import { fetchTaskPermissions } from '../utils/permissions';

const Dashboard = ({ domainName = "" }) => {
    const {
        selectedDomain,
        domainMap,
        tasks,
        loading,
        error,
        fetchTasks,
        updateTask,
        deleteTask,
        getFilteredTasks
    } = useTaskContext();

    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskPermissions, setTaskPermissions] = useState(null);

    // Fetch tasks when component mounts
    useEffect(() => {
        fetchTasks();
    }, []);

    // Handle task operations
    const handleViewDetails = (task) => {
        setSelectedTask(task);
        setShowTaskDetails(true);
    };

    // Handle opening edit modal
    const handleEditTask = async (task) => {
        console.log('Dashboard: Opening edit modal for task:', task);
        try {
            // Fetch permissions for the task
            const permissions = await fetchTaskPermissions(task.id || task._id);
            console.log('Dashboard: Task permissions loaded:', permissions);

            setEditingTask(task);
            setTaskPermissions(permissions);
            setShowEditModal(true);
            setShowTaskDetails(false); // Close details modal if open
        } catch (error) {
            console.error('Dashboard: Failed to load task permissions:', error);
            // Still allow editing with basic permissions
            setEditingTask(task);
            setTaskPermissions({ canEdit: false, canUpdateStatus: true });
            setShowEditModal(true);
            setShowTaskDetails(false);
        }
    };

    const handleUpdateTask = async (taskId, updateData) => {
        console.log('Dashboard: Updating task', taskId, 'with data:', updateData);
        try {
            await updateTask(taskId, updateData);
            console.log('Dashboard: Task update successful, refetching tasks');
            // Refetch tasks to get updated data
            await fetchTasks();
            console.log('Dashboard: Tasks refetched');

            // Close edit modal if open
            setShowEditModal(false);
            setEditingTask(null);
            setTaskPermissions(null);
        } catch (error) {
            console.error('Dashboard: Error updating task:', error);
            alert('Failed to update task');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            // Tasks are automatically updated in context
            setShowTaskDetails(false); // Close modal if open
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Failed to delete task');
        }
    };

    // Get display title based on selected filter/domain
    const getDisplayTitle = () => {
        if (selectedDomain.startsWith('filter:')) {
            const filterType = selectedDomain.replace('filter:', '');
            if (filterType === 'assigned') return 'My Tasks';
            if (filterType === 'created') return 'Created Tasks';
        }
        return selectedDomain === 'General' ? 'All Tasks' : `${selectedDomain} Tasks`;
    };

    console.log('Dashboard render - selectedDomain:', selectedDomain);
    console.log('Tasks from backend:', tasks);

    // Use the context's filtering method that handles both domain and task filters
    const filteredTasks = getFilteredTasks(tasks);

    console.log('Filtered tasks:', filteredTasks.length);

    return (
        <div className="min-h-screen bg-canvas">
            {console.log('[Dashboard] Rendering TaskDetailsModal. showTaskDetails:', showTaskDetails, 'selectedTask:', selectedTask)}
            <Navbar />

            <div className="max-w-[2000px] mx-auto px-6 py-8">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-neutral-200 border-t-sage-300 rounded-full animate-spin"></div>
                            <p className="text-neutral-500 font-medium">Loading tasks...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-status-error-bg border border-status-error/20 rounded-xl p-6 mb-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-status-error font-semibold text-lg">Error loading tasks</h3>
                                <p className="text-status-error/80 text-sm mt-2">{error}</p>
                            </div>
                            <button
                                onClick={() => fetchTasks()}
                                className="btn-secondary text-status-error border-status-error/20 hover:bg-status-error-bg"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                {!loading && (
                    <div className="mb-8 flex flex-row justify-between items-start">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-700 mb-2">
                                {getDisplayTitle()}
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                  <span className="text-neutral-500">
                    <span className="font-medium text-neutral-600">Total:</span> {tasks.length}
                  </span>
                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                <span className="text-neutral-500">
                    <span className="font-medium text-neutral-600">Showing:</span> {filteredTasks.length}
                  </span>
                                <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
                                <span className="text-neutral-500">
                    <span className="font-medium text-neutral-600">Domain:</span> {selectedDomain}
                  </span>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/tasks">
                                <button className="btn-primary flex items-center gap-2 shadow-sage">
                                    <Plus size={18}/>
                                    <span className="hidden sm:inline">Create New Task</span>
                                    <span className="sm:hidden">Create</span>
                                </button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Tasks Grid - FIXED: Removed h-full wrapper */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskCard
                                    key={task._id || task.id}
                                    task={task}
                                    onViewDetails={handleViewDetails}
                                    onUpdate={handleUpdateTask}
                                    onDelete={handleDeleteTask}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <div className="bg-surface rounded-2xl p-12 border border-neutral-200 shadow-sm max-w-md mx-auto">
                                    <div className="text-neutral-400 mb-6">
                                        <svg className="w-20 h-20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <h3 className="text-neutral-600 text-xl font-semibold mb-3">
                                        No tasks found
                                    </h3>
                                    <p className="text-neutral-500 text-sm mb-6">
                                        No tasks available for {getDisplayTitle()}. Create your first task to get started.
                                    </p>
                                    <Link to="/tasks">
                                        <button className="btn-primary inline-flex items-center gap-2">
                                            <Plus size={16}/>
                                            Create First Task
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Task Details Modal */}
            {showTaskDetails && (
                <TaskDetailsModal
                    task={selectedTask}
                    isOpen={true}
                    onClose={() => {
                        setShowTaskDetails(false);
                        setSelectedTask(null);
                    }}
                    onUpdate={handleEditTask}
                    onDelete={handleDeleteTask}
                />
            )}

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingTask(null);
                    setTaskPermissions(null);
                }}
                task={editingTask}
                permissions={taskPermissions}
            />
        </div>
    );
};

export default Dashboard;
