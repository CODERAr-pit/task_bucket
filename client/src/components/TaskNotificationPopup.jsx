import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const TaskNotificationPopup = ({ user, onClose }) => {
  const [unfinishedTasks, setUnfinishedTasks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      checkUnfinishedTasks();
    }
  }, [user]);

  

  const checkUnfinishedTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        // Filter for tasks assigned to current user that are not completed
        const userTasks = data.data.filter(task => {
          // Handle both array and single user assignment
          const isAssigned = Array.isArray(task.assignedTo) 
            ? task.assignedTo.some(assignee => 
                (assignee._id || assignee) === user._id
              )
            : (task.assignedTo._id || task.assignedTo) === user._id;
            
          return isAssigned && task.status !== 'completed';
        });
        
        // Check for overdue or due soon tasks
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const urgentTasks = userTasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          // Show tasks that are overdue or due within 24 hours
          return dueDate <= tomorrow;
        });
        
        if (urgentTasks.length > 0) {
          setUnfinishedTasks(urgentTasks);
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.error('Error checking unfinished tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    if (onClose) {
      onClose();
    }
  };

  const goToDashboard = () => {
    handleClose();
    window.location.href = '/dashboard';
  };

  const getTaskUrgency = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { 
        status: 'overdue', 
        label: `${Math.abs(diffDays)} day(s) overdue`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else if (diffDays === 0) {
      return { 
        status: 'today', 
        label: 'Due today',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      };
    } else if (diffDays === 1) {
      return { 
        status: 'tomorrow', 
        label: 'Due tomorrow',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      };
    } else {
      return { 
        status: 'soon', 
        label: `Due in ${diffDays} days`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!showPopup || unfinishedTasks.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-full">
              <Bell className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Task Reminder</h3>
              <p className="text-sm text-gray-600">You have urgent tasks that need attention</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-gray-700 font-medium">
              You have <span className="font-bold text-orange-600">{unfinishedTasks.length}</span> task(s) that need immediate attention:
            </p>
          </div>
          
          {/* Tasks List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {unfinishedTasks.map((task) => {
              const urgency = getTaskUrgency(task.dueDate);
              
              return (
                <div 
                  key={task._id || task.id} 
                  className={`border rounded-lg p-4 ${urgency.bgColor} ${urgency.borderColor} hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1 pr-2">{task.title}</h4>
                    <div className="flex items-center space-x-2 text-xs">
                      {task.priority && (
                        <span className={`px-2 py-1 rounded-full bg-white ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={urgency.color}>
                          {urgency.label}
                        </span>
                      </div>
                      
                      <span className="text-gray-500">
                        Status: <span className="capitalize font-medium">
                          {task.status.replace('-', ' ')}
                        </span>
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Summary Stats */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <div className="flex space-x-4">
                <span className="text-red-600">
                  {unfinishedTasks.filter(task => getTaskUrgency(task.dueDate).status === 'overdue').length} Overdue
                </span>
                <span className="text-orange-600">
                  {unfinishedTasks.filter(task => getTaskUrgency(task.dueDate).status === 'today').length} Due Today
                </span>
                <span className="text-yellow-600">
                  {unfinishedTasks.filter(task => getTaskUrgency(task.dueDate).status === 'tomorrow').length} Due Tomorrow
                </span>
              </div>
              <span className="text-gray-600">
                Total: {unfinishedTasks.length} tasks
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Complete these tasks to clear notifications
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={goToDashboard}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>View Tasks</span>
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNotificationPopup;
