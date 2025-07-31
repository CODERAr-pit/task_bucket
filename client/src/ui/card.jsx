import React from 'react';
import { User, Calendar, Clock, AlertCircle } from 'lucide-react';

const TaskCard = ({ 
  task = {
    id: 1,
    title: "Complete project management project",
    description: "Create a basic and prototype for the project management application with task tracking and user management",
    taskMaker: "abc",
    assignedTo: "xyz",
    createdAt: "2025-01-15T10:30:00Z",
    dueDate: "2025-01-22T17:00:00Z",
    priority: "high",
    status: "in-progress"
  }
}) => {

  // implemet these functionlities if you want other wise can ignore
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-100';
      case 'in-progress': return 'text-blue-700 bg-blue-100';
      case 'pending': return 'text-yellow-700 bg-yellow-100';
      case 'overdue': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 max-w-md w-full mx-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-2">
            {task.title}
          </h3>
          {task.priority && (
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {task.description}
          </p>
        )}

        {task.status && (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
            {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        )}
      </div>

      {/* Task details etc. */}
      <div className="p-4 space-y-3">
        {/* Task Maker */}
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <span className="text-gray-500 min-w-0">Created by:</span>
          <span className="font-medium text-gray-900 ml-1 truncate">
            {task.taskMaker || 'Unknown'}
          </span>
        </div>

        {/* Assigned To */}
        <div className="flex items-center text-sm">
          <User className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
          <span className="text-gray-500 min-w-0">Assigned to:</span>
          <span className="font-medium text-gray-900 ml-1 truncate">
            {task.assignedTo || 'Unassigned'}
          </span>
        </div>

        {/* Dates */}
        <div className="space-y-2">
          {task.createdAt && (
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-gray-500">Created:</span>
              <span className="text-gray-700 ml-1">
                {formatDate(task.createdAt)}
              </span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-gray-500">Due:</span>
              <span className={`ml-1 ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                {formatDate(task.dueDate)}
              </span>
              {isOverdue(task.dueDate) && (
                <AlertCircle className="w-4 h-4 text-red-500 ml-1" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Task #{task.id}
          </span>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors" onClick={() => {
            alert(`Viewing details for Task #${task.id}`);
          }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;










// Demo data as i am not able to connect pocketbase at local
{ /*const TaskCardDemo = () => {
  const sampleTasks = [
    {
      id: 1,
      title: "Complete project management project",
      description: "Create a basic and prototype for the project management application with task tracking and user management",
      taskMaker: "Subhadip",
      assignedTo: "xyz",
      createdAt: "2025-01-15T10:30:00Z",
      dueDate: "2025-01-22T17:00:00Z",
      priority: "high",
      status: "in-progress"
    },
    {
      id: 2,
      title: "Fix login bug",
      description: "Resolve the authentication issue where users can't log in with special characters in password",
      taskMaker: "Suyash",
      assignedTo: "xyz",
      createdAt: "2024-01-10T14:20:00Z",
      dueDate: "2024-01-18T12:00:00Z",
      priority: "medium",
      status: "completed"
    },
    {
      id: 3,
      title: "Update homepage design",
      description: "Implement the new homepage layout",
      taskMaker: "Arpit",
      assignedTo: "xyz",
      createdAt: "2024-01-08T09:15:00Z",
      dueDate: "2024-01-12T16:30:00Z",
      priority: "low",
      status: "overdue"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Tasks
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskCardDemo; */}