
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
      <div className="min-h-screen bg-bg-primary py-12 px-4">
        <div className="max-w-4xl mx-auto">
          
          <div className="bg-bg-card rounded-3xl shadow-card border border-border-primary overflow-y-scroll scrollbar-hide">
            {/* Header */}
            <div className="bg-status-accepted px-8 py-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create New Task</h2>
              <p className="text-white/80 mt-1">Fill in the details to assign a new task</p>
            </div>

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-status-declined/20 border border-status-declined/30 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-status-declined" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-status-declined font-medium">Error creating task</p>
                      <p className="text-status-declined/80 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Task Title
                </label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted"
                    required
                />
              </div>

              {/* Domain & Assigned By - Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Domain
                  </label>
                  <select
                      name="domain"
                      value={form.domain}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading appearance-none cursor-pointer"
                      required
                  >
                    <option value="" className="bg-bg-primary text-text-muted">Select Domain</option>
                    {domainOptions.map((domain) => (
                        <option key={domain} value={domain} className="bg-bg-primary text-text-heading">{domain}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Assigned By
                  </label>
                  <input
                      name="assignedBy"
                      value={form.assignedBy}
                      onChange={handleChange}
                      placeholder="Your name..."
                      className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted"
                      required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Description
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the task in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading placeholder-text-muted resize-none"
                    required
                />
              </div>

              {/* Assigned To - Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                  Assign To
                </label>
                <DomainSpecificAssignment
                  selectedUsers={form.assignedTo}
                  onUsersChange={(users) => setForm(prev => ({ ...prev, assignedTo: users }))}
                />
              </div>

              {/* Due Date, Reminder Period, Interval & Visibility - Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Reminder Interval (minutes)
                  </label>
                  <input
                      name="reminderIntervalMinutes"
                      value={form.reminderIntervalMinutes}
                      onChange={handleChange}
                      type="number"
                      min={1}
                      className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                  />
                </div> */}
                <div className="space-y-2 ">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Due Date
                  </label>
                  <input
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      type="date"
                      className="w-100 px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                      required
                  />

                </div>
                
                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Reminder Start
                  </label>
                  <input
                      name="reminderStart"
                      value={form.reminderStart}
                      onChange={handleChange}
                      type="date"
                      className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                  />
                </div> */}
                {/* <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text-body uppercase tracking-wide">
                    Reminder End
                  </label>
                  <input
                      name="reminderEnd"
                      value={form.reminderEnd}
                      onChange={handleChange}
                      type="date"
                      className="w-full px-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted transition-all duration-200 bg-bg-primary text-text-heading"
                  />
                </div> */}
              </div>

              {/* Task Visibility */}
              <div className="space-y-3 mt-6">
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

              {/* Submit Button */}
              <div className="pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-status-accepted hover:bg-status-accepted/90 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Task...</span>
                      </div>
                  ) : (
                      "Create Task"
                  )}
                </button>
              </div>
            </form>

            {/* Success Message */}
            {submitted && (
                <div className="mx-8 mb-8 p-4 bg-status-accepted/20 border border-status-accepted/30 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-status-accepted" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-status-accepted font-medium">Task created successfully!</p>
                      <p className="text-status-accepted/80 text-sm">Redirecting to dashboard...</p>
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