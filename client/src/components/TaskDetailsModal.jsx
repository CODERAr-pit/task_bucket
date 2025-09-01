import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, Tag, AlertCircle, FileText } from 'lucide-react';

const TaskDetailsModal = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && (task?._id || task?.id)) {
      fetchComments();
    }
  }, [isOpen, task?._id, task?.id]);

  const fetchComments = async () => {
    const taskId = task?._id ? task._id : task?.id;
    if (!task || !taskId) {
      alert('No valid task ID found.');
      return;
    }
    setLoadingComments(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/comments`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch comments');
      const data = await res.json();
      setComments(data.comments || data);
    } catch (err) {
      console.error('[Comments] Error fetching comments:', err);
      setError('Could not load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    const taskId = task?._id ? task._id : task?.id;
    if (!isOpen) {
      alert('Cannot post comment: modal is not open.');
      return;
    }
    if (!commentText.trim() || !task || !taskId) {
      alert('Cannot post comment: invalid comment or task.');
      return;
    }
    setAddingComment(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ text: commentText }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert('Failed to add comment: ' + errorText);
        throw new Error('Failed to add comment');
      }
      setCommentText('');
      await fetchComments();
    } catch (err) {
      console.error('[Comments] Error posting comment:', err);
      setError('Could not add comment');
    } finally {
      setAddingComment(false);
    }
  };
  if (!isOpen || !task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          color: 'text-status-accepted bg-status-accepted/20 border-status-accepted/30',
          dot: 'bg-status-accepted'
        };
      case 'in-progress':
        return {
          color: 'text-blue-400 bg-blue-400/20 border-blue-400/30',
          dot: 'bg-blue-400'
        };
      case 'pending':
      case 'todo':
        return {
          color: 'text-status-pending bg-status-pending/20 border-status-pending/30',
          dot: 'bg-status-pending'
        };
      case 'overdue':
        return {
          color: 'text-status-declined bg-status-declined/20 border-status-declined/30',
          dot: 'bg-status-declined'
        };
      default:
        return {
          color: 'text-text-muted bg-text-muted/20 border-text-muted/30',
          dot: 'bg-text-muted'
        };
    }
  };

  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          color: 'text-status-declined bg-status-declined/20 border-status-declined/30',
          dot: 'bg-status-declined'
        };
      case 'medium':
        return {
          color: 'text-status-pending bg-status-pending/20 border-status-pending/30',
          dot: 'bg-status-pending'
        };
      case 'low':
        return {
          color: 'text-status-accepted bg-status-accepted/20 border-status-accepted/30',
          dot: 'bg-status-accepted'
        };
      default:
        return {
          color: 'text-text-muted bg-text-muted/20 border-text-muted/30',
          dot: 'bg-text-muted'
        };
    }
  };

  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-bg-card rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-scroll scrollbar-hide  border border-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div>
            <h2 className="text-2xl font-bold text-text-heading">{task.title}</h2>
            <p className="text-text-muted text-sm mt-1">Task Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-card-hover rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-body">Status:</span>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium capitalize ${statusConfig.color}`}>
                <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                {task.status}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-body">Priority:</span>
              <div className={`flex items-center gap-2 rounded-lg border px-3 py-1 text-sm font-medium capitalize ${priorityConfig.color}`}>
                <div className={`w-2 h-2 rounded-full ${priorityConfig.dot}`}></div>
                {task.priority || 'medium'}
              </div>
            </div>
          </div>
          {/* Description */}
          {task.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-body">Description</span>
              </div>
              <p className="text-text-body leading-relaxed bg-bg-primary p-4 rounded-lg border border-border-primary">
                {task.description}
              </p>
            </div>
          )}
          {/* Domain */}
          {task.domain && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-body">Domain</span>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-400/20 text-blue-400 border border-blue-400/30">
                {task.domain}
              </span>
            </div>
          )}
          {/* People */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.taskMakerName && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-body">Created By</span>
                </div>
                <div className="flex items-center gap-3 bg-bg-primary p-3 rounded-lg border border-border-primary">
                  <div className="w-10 h-10 bg-gradient-to-br from-text-muted to-text-body rounded-full flex items-center justify-center text-text-heading font-semibold">
                    {(task.taskMakerName || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-heading">{task.taskMakerName}</p>
                    <p className="text-sm text-text-muted">Task Creator</p>
                  </div>
                </div>
              </div>
            )}
            {task.assignedToName && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-body">
                    {Array.isArray(task.assignedToName) && task.assignedToName.length > 1 
                      ? 'Assigned To' 
                      : 'Assigned To'
                    }
                  </span>
                </div>
                {/* Handle multiple assignees */}
                {Array.isArray(task.assignedToName) ? (
                  <div className="space-y-2">
                    {task.assignedToName.map((name, index) => (
                      <div key={index} className="flex items-center gap-3 bg-bg-primary p-3 rounded-lg border border-border-primary">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-heading">{name}</p>
                          <p className="text-sm text-text-muted">
                            {task.assignedToName.length > 1 ? `Assignee ${index + 1}` : 'Assignee'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Fallback for single assignee (backward compatibility)
                  <div className="flex items-center gap-3 bg-bg-primary p-3 rounded-lg border border-border-primary">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {(task.assignedToName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-text-heading">{task.assignedToName}</p>
                      <p className="text-sm text-text-muted">Assignee</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.createdAt && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-body">Created At</span>
                </div>
                <p className="text-text-body bg-bg-primary p-3 rounded-lg border border-border-primary">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            )}
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-body">Due Date</span>
                </div>
                <div className="flex items-center gap-2 bg-bg-primary p-3 rounded-lg border border-border-primary">
                  <p className="text-text-body">{formatDate(task.dueDate)}</p>
                  {new Date(task.dueDate) < new Date() && (
                    <AlertCircle className="w-4 h-4 text-status-declined" />
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Comments Section - always at bottom, always rendered */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2 text-text-heading">Discussion Thread</h3>
            <div className="bg-bg-primary rounded-lg border border-border-primary p-4">
              {loadingComments ? (
                <div className="text-text-muted">Loading comments...</div>
              ) : error ? (
                <div className="text-status-declined">{error}</div>
              ) : comments.length === 0 ? (
                <div className="text-text-muted">No comments yet.</div>
              ) : (
                <ul className="space-y-4">
                  {comments.map((comment, idx) => (
                    <li key={comment._id || idx} className="border-b border-border-primary pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-400/30 flex items-center justify-center font-bold text-blue-700">
                          {comment.user?.name?.charAt(0).toUpperCase() || comment.user?.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-text-heading">{comment.user?.name || comment.user?.email || 'User'}</span>
                          <span className="ml-2 text-xs text-text-muted">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-1 text-text-body">{comment.text}</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-border-primary rounded-lg px-3 py-2 text-text-body bg-bg-card"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  disabled={addingComment}
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  disabled={addingComment || !commentText.trim()}
                >
                  {addingComment ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-bg-primary border-t border-border-primary flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-body bg-bg-card border border-border-primary rounded-lg hover:bg-bg-card-hover transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onUpdate?.(task);
              // Don't close modal, let parent handle it
            }}
            className="px-4 py-2 bg-status-accepted text-white rounded-lg hover:bg-status-accepted/90 transition-colors"
          >
            Edit Task
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                onDelete?.(task.id || task._id);
                onClose();
              }
            }}
            className="px-4 py-2 bg-status-declined text-white rounded-lg hover:bg-status-declined/90 transition-colors"
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
