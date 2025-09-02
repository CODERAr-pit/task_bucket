import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, User, Tag, AlertCircle, FileText, Send, Trash2 } from 'lucide-react';

const TaskDetailsModal = ({ task, currentUser, isOpen, onClose, onUpdate, onDelete }) => {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [addingComment, setAddingComment] = useState(false);
    const [error, setError] = useState(null);

    const fetchComments = async () => {
        const taskId = task?._id || task?.id;
        if (!taskId) return;
        setLoadingComments(true);
        setError(null);
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiUrl}/api/tasks/${taskId}/comments`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            if (!res.ok) throw new Error('Failed to fetch comments');
            const data = await res.json();
            setComments(data.comments || data);
        } catch (err) {
            setError('Could not load comments');
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        const taskId = task?._id || task?.id;
        if (!commentText.trim() || !taskId) return;
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
            if (!res.ok) throw new Error('Failed to add comment');
            setCommentText('');
            await fetchComments();
        } catch (err) {
            setError('Could not add comment');
        } finally {
            setAddingComment(false);
        }
    };

    // *** FIXED: Now checks for task._id OR task.id to fetch comments ***
    useEffect(() => {
        if (isOpen && (task?._id || task?.id)) {
            fetchComments();
        } else {
            setComments([]);
            setError(null);
        }
    }, [isOpen, task?._id, task?.id]); // Dependency array updated


    if (!isOpen || !task) return null;

    // --- Helper functions for styling ---
    const formatDate = (dateString, withTime = false) => {
        if (!dateString) return 'No date set';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (withTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const InfoPill = ({ label, value, icon, colorClasses }) => (
        <div>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-sm font-medium text-text-secondary">{label}</span></div>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold ${colorClasses}`}>{value}</div>
        </div>
    );
    const getStatusConfig = (status) => {
        const s = status?.toLowerCase();
        if (s === "completed" || s === "accepted") return "bg-emerald-900/40 text-emerald-300";
        if (s === "in-progress") return "bg-blue-900/40 text-blue-300";
        if (s === "pending" || s === "todo") return "bg-amber-900/40 text-amber-300";
        if (s === "overdue" || s === "declined") return "bg-red-900/40 text-red-300";
        return "bg-surface text-text-secondary";
    };
    const getPriorityConfig = (priority) => {
        const p = priority?.toLowerCase();
        if (p === 'high') return "bg-red-900/40 text-red-300";
        if (p === 'medium') return "bg-amber-900/40 text-amber-300";
        if (p === 'low') return "bg-emerald-900/40 text-emerald-300";
        return "bg-surface text-text-secondary";
    };
    const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-surface rounded-2xl shadow-soft-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-border" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{task.title}</h2>
                        <p className="text-text-secondary text-sm mt-1">In domain: <span className="font-semibold text-primary">{task.domain}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:bg-border rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <InfoPill label="Status" value={task.status} icon={<Tag size={16} className="text-text-secondary" />} colorClasses={getStatusConfig(task.status)} />
                        <InfoPill label="Priority" value={task.priority || 'Medium'} icon={<AlertCircle size={16} className="text-text-secondary" />} colorClasses={getPriorityConfig(task.priority)} />
                        <div>
                            <div className="flex items-center gap-2 mb-2"><Clock size={16} className="text-text-secondary" /><span className="text-sm font-medium text-text-secondary">Due Date</span></div>
                            <p className={`text-sm font-semibold p-2 rounded-md ${new Date(task.dueDate) < new Date() ? 'text-red-300' : 'text-text-primary'}`}>{formatDate(task.dueDate)}</p>
                        </div>
                    </div>

                    {task.description && (
                        <div>
                            <div className="flex items-center gap-2 mb-2"><FileText size={16} className="text-text-secondary" /><span className="text-sm font-medium text-text-secondary">Description</span></div>
                            <p className="text-text-secondary leading-relaxed bg-background p-4 rounded-lg border border-border">{task.description}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2"><User size={16} className="text-text-secondary" /><span className="text-sm font-medium text-text-secondary">Created By</span></div>
                            <div className="flex items-center gap-3 bg-background p-3 rounded-lg border border-border">
                                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{getInitials(task.taskMakerName)}</div>
                                <div><p className="font-semibold text-text-primary">{task.taskMakerName}</p><p className="text-sm text-text-secondary">Creator</p></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-2"><User size={16} className="text-text-secondary" /><span className="text-sm font-medium text-text-secondary">Assignees</span></div>
                            <div className="flex -space-x-3">
                                {Array.isArray(task.assignedToName) && task.assignedToName.map((name, index) => (
                                    <div key={index} className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-surface" title={name}>{getInitials(name)}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold mb-3 text-text-primary">Discussion</h3>
                        <div className="space-y-4">
                            {loadingComments && <p className="text-text-secondary text-sm">Loading comments...</p>}
                            {error && <p className="text-red-400 text-sm">{error}</p>}
                            {!loadingComments && !error && comments.length === 0 && <p className="text-text-secondary text-sm">No comments yet. Start the discussion!</p>}
                            {comments.map((comment) => (
                                <div key={comment._id} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center font-bold text-text-secondary text-sm flex-shrink-0">{getInitials(comment.user?.name)}</div>
                                    <div className="flex-1 bg-background p-3 rounded-lg border border-border">
                                        <div className="flex items-center justify-between"><span className="font-semibold text-text-primary text-sm">{comment.user?.name}</span><span className="text-xs text-text-secondary">{new Date(comment.createdAt).toLocaleDateString()}</span></div>
                                        <p className="text-text-secondary text-sm mt-1">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-3 items-center">
                            <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center font-bold text-text-secondary text-sm flex-shrink-0">{getInitials(currentUser?.name)}</div>
                            <div className="relative flex-1">
                                <input type="text" className="w-full border border-border rounded-full px-4 py-2 text-text-primary bg-background focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} disabled={addingComment} />
                                <button onClick={handleAddComment} className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-full hover:bg-primary-hover disabled:bg-border" disabled={addingComment || !commentText.trim()}><Send size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-background border-t border-border flex gap-3 justify-end flex-shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-text-primary bg-surface border border-border rounded-lg hover:bg-border transition-colors">Close</button>
                    <button onClick={() => onUpdate?.(task)} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover transition-colors">Edit Task</button>
                    <button onClick={() => { if (confirm('Are you sure you want to delete this task?')) { onDelete?.(task.id || task._id); onClose(); } }} className="p-2 text-red-400 bg-surface border border-border rounded-lg hover:bg-red-900/40 hover:border-red-700/50 transition-colors"><Trash2 size={20} /></button>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsModal;