
import React, { useEffect, useState } from 'react';
import TaskCard from "../ui/card.jsx";
import Navbar from "../ui/Navbar.jsx";
import Footer from "./Footer.jsx";
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
    try {
      // Fetch permissions for the task
      const permissions = await fetchTaskPermissions(task.id || task._id);
      
      
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
    try {
      await updateTask(taskId, updateData);
      // Refetch tasks to get updated data
      await fetchTasks();
      
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

  // Use the context's filtering method that handles both domain and task filters
  const filteredTasks = getFilteredTasks(tasks);

  return (
      <div className="min-h-screen bg-bg-primary flex flex-col">
        <Navbar />

        <div className="max-w-[1700px] mx-auto px-4 py-6 flex-1">
          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-border-primary border-t-status-pending rounded-full animate-spin"></div>
                <p className="text-text-body">Loading tasks...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-status-declined/10 border border-status-declined/30 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-status-declined font-medium">Error loading tasks</h3>
                  <p className="text-status-declined/80 text-sm mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => fetchTasks()} 
                  className="bg-status-declined text-text-heading px-4 py-2 rounded-2xl hover:bg-status-declined/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Header Section */}
          {!loading && (
            <div className="mb-4 flex flex-row justify-between items-center">
              <div>
                <h2 className="text-l sm:text-xl font-semibold text-text-heading">
                  {getDisplayTitle()}
                </h2>
                <p className="text-text-muted">
                  Total: {tasks.length} | Showing: {filteredTasks.length} | Domain: {selectedDomain}
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/tasks">
                  <button className="bg-bg-card hover:bg-bg-card-hover text-text-heading py-2 px-3 rounded-2xl font-medium text-sm transition-all duration-200 shadow-card hover:shadow-card-hover flex items-center justify-center gap-1 border border-border-primary">
                    <Plus size={20}/>
                    Create New Task
                  </button>
                </Link>
              </div>
            </div>
          )}

          {/* Tasks Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                      <div key={task._id || task.id} className="h-96">
                        <TaskCard 
                          task={task} 
                          onViewDetails={handleViewDetails}
                          onUpdate={handleUpdateTask}
                          onDelete={handleDeleteTask}
                        />
                      </div>
                  ))
              ) : (
                  <div className="col-span-full text-center py-12">
                    <div className="text-text-muted mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-text-body text-lg mb-2">
                      No tasks found for {getDisplayTitle()}
                    </p>
                    <p className="text-text-muted text-sm">
                      Create your first task to get started
                    </p>
                  </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <Footer />
        
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