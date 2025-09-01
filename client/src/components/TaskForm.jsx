import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../ui/Navbar.jsx";
import { useTaskContext } from "../context/TaskContext.jsx";
import DomainSpecificAssignment from "./DomainSpecificAssignment.jsx";

const initialFormState = {
    title: "",
    domain: "",
    description: "",
    assignedTo: [],
    assignedBy: "",
    dueDate: "",
    visibility: "public",
    reminderStart: "",
    reminderEnd: "",
    reminderIntervalMinutes: 1440,
};

const domainOptions = [
    "Graphic Designing",
    "Web Development",
    "Content Writing",
    "Video Editing",
];

const CreateTaskForm = () => {
    const [form, setForm] = useState(initialFormState);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { createTask } = useTaskContext();
    const navigate = useNavigate();

    function handleChange(e) {
        const { name, value, type, selectedOptions } = e.target;
        if (type === "select-multiple") {
            setForm((prev) => ({
                ...prev,
                [name]: Array.from(selectedOptions, (option) => option.value)
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Get current user data for taskMaker and default assignedTo
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');

            // Prepare task data for backend
            const taskData = {
                title: form.title,
                description: form.description,
                domain: form.domain,
                assignedTo: form.assignedTo.length > 0 ? form.assignedTo : [userData._id || userData.id],
                dueDate: form.dueDate,
                priority: 'medium',
                visibility: form.visibility,
                reminderStart: form.reminderStart,
                reminderEnd: form.reminderEnd,
                reminderIntervalMinutes: form.reminderIntervalMinutes
            };

            console.log("Submitting task:", taskData);

            // Call the API to create task
            const newTask = await createTask(taskData);

            console.log("Task created successfully:", newTask);
            setSubmitted(true);

            // Reset form after 2 seconds and redirect to dashboard
            setTimeout(() => {
                setSubmitted(false);
                setForm(initialFormState);
                navigate('/dashboard'); // Redirect to dashboard to see the new task
            }, 2000);

        } catch (err) {
            setError(err.message || 'Failed to create task');
            console.error("Error creating task:", err);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-canvas py-12 px-4">
                <div className="max-w-4xl mx-auto">

                    <div className="bg-surface rounded-2xl shadow-lg border border-neutral-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-6">
                            <h2 className="text-2xl font-bold text-white tracking-tight">Create New Task</h2>
                            <p className="text-emerald-100 mt-2">Fill in the details to assign a new task</p>
                        </div>

                        {/* Form Container */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                            <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-rose-700 font-semibold">Error creating task</p>
                                            <p className="text-rose-600 text-sm mt-1">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                    Task Title
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title..."
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-250 bg-surface text-neutral-700 placeholder-neutral-400 shadow-sm"
                                    required
                                />
                            </div>

                            {/* Domain & Assigned By - Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                        Domain
                                    </label>
                                    <select
                                        name="domain"
                                        value={form.domain}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-250 bg-surface text-neutral-700 appearance-none cursor-pointer shadow-sm"
                                        required
                                    >
                                        <option value="" className="bg-surface text-neutral-400">Select Domain</option>
                                        {domainOptions.map((domain) => (
                                            <option key={domain} value={domain} className="bg-surface text-neutral-700">{domain}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                        Assigned By
                                    </label>
                                    <input
                                        name="assignedBy"
                                        value={form.assignedBy}
                                        onChange={handleChange}
                                        placeholder="Your name..."
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-250 bg-surface text-neutral-700 placeholder-neutral-400 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Describe the task in detail..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-250 bg-surface text-neutral-700 placeholder-neutral-400 resize-none shadow-sm"
                                    required
                                />
                            </div>

                            {/* Assigned To - Full Width */}
                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                    Assign To
                                </label>
                                <DomainSpecificAssignment
                                    selectedUsers={form.assignedTo}
                                    onUsersChange={(users) => setForm(prev => ({ ...prev, assignedTo: users }))}
                                />
                            </div>

                            {/* Due Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                        Due Date
                                    </label>
                                    <input
                                        name="dueDate"
                                        value={form.dueDate}
                                        onChange={handleChange}
                                        type="date"
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-250 bg-surface text-neutral-700 shadow-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Task Visibility */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-neutral-700 uppercase tracking-wide">
                                    Task Visibility
                                </label>
                                <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="public"
                                                checked={form.visibility === "public"}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-emerald-500 border-neutral-300 focus:ring-emerald-500 focus:ring-2"
                                            />
                                            <div className="ml-3">
                                                <span className="text-sm font-semibold text-neutral-700">Public</span>
                                                <p className="text-xs text-neutral-500 mt-0.5">Visible to all users</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="private"
                                                checked={form.visibility === "private"}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-emerald-500 border-neutral-300 focus:ring-emerald-500 focus:ring-2"
                                            />
                                            <div className="ml-3">
                                                <span className="text-sm font-semibold text-neutral-700">Private</span>
                                                <p className="text-xs text-neutral-500 mt-0.5">Only visible to assignees</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-250 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl focus:ring-4 focus:ring-emerald-200"
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center space-x-3">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating Task...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Create Task</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Success Message */}
                        {submitted && (
                            <div className="mx-8 mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-emerald-700 font-semibold">Task created successfully!</p>
                                        <p className="text-emerald-600 text-sm mt-1">Redirecting to dashboard...</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateTaskForm;
