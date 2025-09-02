import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../ui/Navbar.jsx";
import { useTaskContext } from "../context/TaskContext.jsx";
import DomainSpecificAssignment from "./DomainSpecificAssignment.jsx";
import Footer from "./Footer.jsx";
import { ArrowLeft, CheckCircle } from "lucide-react";

const initialFormState = {
    title: "",
    domain: "",
    description: "",
    assignedTo: [],
    dueDate: "",
    visibility: "public",
    priority: "medium",
};

const domainOptions = ["Graphic Designing", "Web Development", "Content Writing", "Video Editing", "General"];

const CreateTaskForm = () => {
    const [form, setForm] = useState(initialFormState);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { createTask } = useTaskContext();
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const taskData = { ...form };
            if (taskData.assignedTo.length === 0) {
                const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                taskData.assignedTo = [userData._id || userData.id];
            }
            await createTask(taskData);
            setSubmitted(true);
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <Navbar />
            <main className="w-full max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex-grow">
                {/* Page Header */}
                <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center sm:items-start">
                        <h1 className="text-3xl md:text-4xl font-bold text-text-primary tracking-tighter">Create New Task</h1>
                        <p className="text-text-secondary mt-1">Delegate a new task to your team.</p>
                    </div>
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary font-semibold transition-colors">
                        <ArrowLeft size={16} />
                        Back to Dashboard
                    </Link>
                </header>

                {submitted ? (
                    <div className="bg-surface border border-border rounded-xl p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-text-primary">Task Created Successfully!</h2>
                        <p className="text-text-secondary mt-2">Redirecting you back to the dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-6 bg-red-800/40 border border-red-700/50 text-red-300 rounded-lg p-3">
                                <p className="font-medium text-sm">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
                            {/* --- Left Column --- */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Task Title</label>
                                    <input name="title" value={form.title} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Description</label>
                                    <textarea name="description" value={form.description} onChange={handleChange} rows={5} required className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Domain</label>
                                        <select name="domain" value={form.domain} onChange={handleChange} required className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                            <option value="">Select</option>
                                            {domainOptions.map((domain) => (<option key={domain} value={domain}>{domain}</option>))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Due Date</label>
                                        <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date" required className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Priority</label>
                                    <select name="priority" value={form.priority} onChange={handleChange} className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Visibility</label>
                                    <div className="flex items-center space-x-4 p-3 bg-surface rounded-lg border border-border">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="visibility" value="public" checked={form.visibility === "public"} onChange={handleChange} className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-surface" />
                                            <span className="ml-2 text-sm font-medium text-text-primary">Public</span>
                                        </label>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name="visibility" value="private" checked={form.visibility === "private"} onChange={handleChange} className="w-4 h-4 text-primary bg-background border-border focus:ring-primary focus:ring-offset-surface" />
                                            <span className="ml-2 text-sm font-medium text-text-primary">Private</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* --- Right Column --- */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Assign To Members</label>
                                    <DomainSpecificAssignment selectedUsers={form.assignedTo} onUsersChange={(users) => setForm(prev => ({ ...prev, assignedTo: users }))} />
                                    <p className="text-xs text-text-secondary mt-2">If no one is selected, the task is assigned to you.</p>
                                </div>
                            </div>
                        </div>

                        {/* --- Centered Button --- */}
                        <div className="pt-8 mt-8 border-t border-border flex justify-center">
                            <button type="submit" disabled={isSubmitting} className="w-full max-w-xs flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-lg transition-colors duration-250 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-primary/50">
                                {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin mr-3"></div><span>Creating...</span></>) : "Create Task"}
                            </button>
                        </div>
                    </form>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CreateTaskForm;