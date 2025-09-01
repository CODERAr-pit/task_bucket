import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Users } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { canUserEditTask, canUserUpdateStatus } from '../utils/permissions';

const EditTaskModal = ({ isOpen, onClose, task, permissions }) => {
  const { updateTask } = useTaskContext();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: [],
    domain: '',
    dueDate: '',
    status: 'todo',
    priority: 'medium',
    visibility: 'public'
  });

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (task && isOpen) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : (task.assignedTo ? [task.assignedTo] : []),
        domain: task.domain || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        visibility: task.visibility || 'public'
      });
    }
  }, [task, isOpen]);

  // Fetch users for assignment
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/users`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUsers(userData.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAssignee = (userId) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter(id => id !== userId)
        : [...prev.assignedTo, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateTask(task.id || task._id, form);
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-card border border-border-primary">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-text-heading">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-card-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-body" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - Only editable by seniors or if no permissions loaded yet */}
          {(canUserEditTask(permissions) || !permissions) && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                Task Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                type="text"
                placeholder="Enter task title..."
                className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted"
                required
              />
            </div>
          )}

          {/* Description - Only editable by seniors or if no permissions loaded yet */}
          {(canUserEditTask(permissions) || !permissions) && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the task in detail..."
                rows="4"
                className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted resize-none"
                required
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Domain - Only editable by seniors or if no permissions loaded yet */}
            {(canUserEditTask(permissions) || !permissions) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Domain
                </label>
                <select
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                  required
                >
                  <option value="" className="bg-bg-primary text-text-muted">Select Domain</option>
                  <option value="Web Development" className="bg-bg-primary text-text-heading">Web Development</option>
                  <option value="Content Writing" className="bg-bg-primary text-text-heading">Content Writing</option>
                  <option value="Graphic Designing" className="bg-bg-primary text-text-heading">Graphic Designing</option>
                  <option value="Video Editing" className="bg-bg-primary text-text-heading">Video Editing</option>
                  <option value="General" className="bg-bg-primary text-text-heading">General</option>
                </select>
              </div>
            )}

            {/* Status - Everyone can update */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
              >
                <option value="todo" className="bg-bg-primary text-text-heading">Todo</option>
                <option value="in-progress" className="bg-bg-primary text-text-heading">In Progress</option>
                <option value="completed" className="bg-bg-primary text-text-heading">Completed</option>
              </select>
            </div>

            {/* Priority - Only editable by seniors or if no permissions loaded yet */}
            {(canUserEditTask(permissions) || !permissions) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                >
                  <option value="low" className="bg-bg-primary text-text-heading">Low</option>
                  <option value="medium" className="bg-bg-primary text-text-heading">Medium</option>
                  <option value="high" className="bg-bg-primary text-text-heading">High</option>
                </select>
              </div>
            )}

            {/* Visibility - Only editable by seniors or if no permissions loaded yet */}
            {(canUserEditTask(permissions) || !permissions) && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Task Visibility
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={form.visibility === "public"}
                      onChange={handleChange}
                      className="w-4 h-4 text-status-accepted border-border-primary focus:ring-status-accepted focus:ring-2"
                    />
                    <span className="ml-2 text-sm font-medium text-text-body">Public</span>
                    <span className="ml-1 text-xs text-text-muted">(Visible to all users)</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={form.visibility === "private"}
                      onChange={handleChange}
                      className="w-4 h-4 text-status-accepted border-border-primary focus:ring-status-accepted focus:ring-2"
                    />
                    <span className="ml-2 text-sm font-medium text-text-body">Private</span>
                    <span className="ml-1 text-xs text-text-muted">(Only visible to assignees)</span>
                  </label>
                </div>
              </div>
            )}

            {/* Due Date - Only editable by seniors or if no permissions loaded yet */}
            {(canUserEditTask(permissions) || !permissions) && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  type="date"
                  className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                  required
                />
              </div>
            )}
          </div>
          

          {/* Assignees - Only editable by seniors or if no permissions loaded yet */}
          {(canUserEditTask(permissions) || !permissions) && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                Assign To Team Members
              </label>

              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted"
                />
              </div>

            {/* Team Member Selection */}
            <div className="space-y-2 max-h-40 overflow-y-auto border border-border-primary rounded-xl bg-bg-primary">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => toggleAssignee(user.id)}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-bg-card-hover ${
                      form.assignedTo.includes(user.id)
                        ? 'bg-status-accepted/20 border-l-4 border-status-accepted'
                        : 'hover:bg-bg-card-hover'
                    }`}
                  >
                    <span className={`font-medium ${
                      form.assignedTo.includes(user.id) ? 'text-status-accepted' : 'text-text-heading'
                    }`}>
                      {user.name}
                    </span>
                    {form.assignedTo.includes(user.id) && (
                      <svg className="w-5 h-5 text-status-accepted" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-text-muted text-center">
                  {loadingUsers ? 'Loading team members...' : 'No team members found'}
                </div>
              )}
            </div>

            {/* Selected Assignees */}
            {form.assignedTo.length > 0 && (
              <div>
                <p className="text-xs text-text-muted mb-2">Selected ({form.assignedTo.length}):</p>
                <div className="flex flex-wrap gap-2">
                  {form.assignedTo.map((userId) => {
                    const user = users.find(u => u.id === userId);
                    return (
                      <span
                        key={userId}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-status-accepted/20 text-status-accepted cursor-pointer hover:bg-status-accepted/30 transition-colors border border-status-accepted/30"
                        onClick={() => toggleAssignee(userId)}
                      >
                        {user ? user.name : userId}
                        <svg className="ml-2 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-bg-primary hover:bg-bg-card-hover text-text-body font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-border-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-status-accepted hover:bg-status-accepted/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
