import React, { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';
import { useTaskContext } from '../context/TaskContext';
import { canUserEditTask } from '../utils/permissions';

const EditTaskModal = ({ isOpen, onClose, task, permissions, onUpdate }) => {
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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);


    useEffect(() => {
        if (task && isOpen) {
            // Handle assignedTo field properly - extract IDs from objects if needed
            let assignedToIds = [];
            if (Array.isArray(task.assignedTo)) {
                assignedToIds = task.assignedTo.map(user => 
                    typeof user === 'object' && user !== null ? (user._id || user.id) : user
                ).filter(Boolean);
            } else if (task.assignedTo) {
                const assignedUser = task.assignedTo;
                const userId = typeof assignedUser === 'object' ? (assignedUser._id || assignedUser.id) : assignedUser;
                if (userId) assignedToIds = [userId];
            }

            const formData = {
                title: task.title || '',
                description: task.description || '',
                assignedTo: assignedToIds,
                domain: task.domain || '',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                visibility: task.visibility || 'public'
            };
            
            setForm(formData);
        }
    }, [task, isOpen]);

    useEffect(() => {
        if (isOpen) fetchUsers();
    }, [isOpen]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const token = localStorage.getItem('accessToken');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/tasks/users`, {
                headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            if (response.ok) {
                const userData = await response.json();
                setUsers(userData.users || []);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            const taskId = task._id || task.id;
            if (!taskId) {
                throw new Error('Task ID not found');
            }
            
            if (onUpdate) {
                await onUpdate(taskId, form);
            } else {
                await updateTask(taskId, form);
            }
            onClose();
        } catch (error) {
            console.error('Error updating task:', error);
            alert(error.message || 'Failed to update task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!isOpen) return null;

    const canEditCoreFields = canUserEditTask(permissions) || !permissions;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-surface rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-soft-xl border border-border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-text-primary">Edit Task</h2>
                    <button onClick={onClose} className="p-2 text-text-secondary hover:bg-border rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto pr-2 scrollbar-hide">
                    {canEditCoreFields && (
                        <>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Task Title</label>
                                <input name="title" value={form.title} onChange={handleChange} type="text" required className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows="4" required className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {canEditCoreFields && (
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Domain</label>
                                <select name="domain" value={form.domain} onChange={handleChange} required className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                    <option value="">Select Domain</option>
                                    <option value="Web Development">Web Development</option>
                                    <option value="Content Writing">Content Writing</option>
                                    <option value="Graphic Designing">Graphic Designing</option>
                                    <option value="Video Editing">Video Editing</option>
                                    <option value="General">General</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Status</label>
                            <select name="status" value={form.status} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                <option value="todo">Todo</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        {canEditCoreFields && (
                            <>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Priority</label>
                                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Due Date</label>
                                    <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" required className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                </div>
                            </>
                        )}
                    </div>

                    {canEditCoreFields && (
                        <div>
                            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Assign To</label>
                            <div className="relative mb-2">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-text-secondary" /></div>
                                <input type="text" placeholder="Search team members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                            </div>
                            <div className="space-y-1 max-h-40 overflow-y-auto border border-border rounded-lg bg-background p-1">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <div key={user.id} onClick={() => toggleAssignee(user.id)} className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md transition-colors ${form.assignedTo.includes(user.id) ? 'bg-primary/10' : 'hover:bg-border'}`}>
                                            <span className={`font-medium text-sm ${form.assignedTo.includes(user.id) ? 'text-primary' : 'text-text-primary'}`}>{user.name}</span>
                                            {form.assignedTo.includes(user.id) && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-text-secondary text-center text-sm">{loadingUsers ? 'Loading...' : 'No members found'}</div>
                                )}
                            </div>
                            {form.assignedTo.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {form.assignedTo.map((userId) => {
                                        const user = users.find(u => u.id === userId);
                                        return user ? (<span key={userId} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/20 text-primary cursor-pointer" onClick={() => toggleAssignee(userId)}>{user.name}<X size={12} className="ml-1.5"/></span>) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-border">
                        <button type="button" onClick={onClose} className="flex-1 bg-surface hover:bg-border text-text-primary font-bold py-3 px-6 rounded-lg transition-colors border border-border">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            {isSubmitting ? (<div className="flex items-center justify-center"><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2"></div><span>Updating...</span></div>) : "Update Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTaskModal;