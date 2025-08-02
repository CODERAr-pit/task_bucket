import React, { useState } from "react";
import Navbar from "../ui/Navbar.jsx";

const initialFormState = {
  title: "",
  domain: "",
  description: "",
  assignedTo: [],
  assignedBy: "",
  dueDate: "",
};

const domainOptions = [
  "Graphic Design",
  "Web Development",
  "Content Writing",
  "Video Editing",
  "All",
];

const juniorOptions = [
  "Junior A",
  "Junior B",
  "Junior C",
];

const CreateTaskForm = () => {
  const [form, setForm] = useState(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Form submitted:", form);
    setSubmitted(true);
    setIsSubmitting(false);

    // Reset form after 2 seconds
    setTimeout(() => {
      setSubmitted(false);
      setForm(initialFormState);
      setSearchTerm("");
    }, 2000);
  }

  // Filter junior options based on search term
  const filteredJuniorOptions = juniorOptions.filter(junior =>
      junior.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding/removing assignees
  const toggleAssignee = (junior) => {
    setForm(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(junior)
          ? prev.assignedTo.filter(person => person !== junior)
          : [...prev.assignedTo, junior]
    }));
  };

  return (
      <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Create New Task</h2>
              <p className="text-blue-100 mt-1">Fill in the details to assign a new task</p>
            </div>

            {/* Form Container */}
            <div className="p-8 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Task Title
                </label>
                <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white"
                    required
                />
              </div>

              {/* Domain & Assigned By - Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Domain
                  </label>
                  <select
                      name="domain"
                      value={form.domain}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white appearance-none cursor-pointer"
                      required
                  >
                    <option value="">Select Domain</option>
                    {domainOptions.map((domain) => (
                        <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Assigned By
                  </label>
                  <input
                      name="assignedBy"
                      value={form.assignedBy}
                      onChange={handleChange}
                      placeholder="Your name..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white"
                      required
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the task in detail..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white resize-none"
                    required
                />
              </div>

              {/* Assigned To & Due Date - Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Assign To
                  </label>

                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search team members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white"
                    />
                  </div>

                  {/* Team Member Selection */}
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50/50">
                    {filteredJuniorOptions.length > 0 ? (
                        filteredJuniorOptions.map((junior) => (
                            <div
                                key={junior}
                                onClick={() => toggleAssignee(junior)}
                                className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors duration-150 hover:bg-blue-50 ${
                                    form.assignedTo.includes(junior)
                                        ? 'bg-blue-100 border-l-4 border-blue-500'
                                        : 'hover:bg-slate-100'
                                }`}
                            >
                        <span className={`font-medium ${
                            form.assignedTo.includes(junior) ? 'text-blue-800' : 'text-slate-700'
                        }`}>
                          {junior}
                        </span>
                              {form.assignedTo.includes(junior) && (
                                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                              )}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-slate-500 text-center">
                          No team members found
                        </div>
                    )}
                  </div>

                  {/* Selected Assignees */}
                  {form.assignedTo.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-600 mb-2">Selected ({form.assignedTo.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {form.assignedTo.map((person) => (
                              <span
                                  key={person}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                                  onClick={() => toggleAssignee(person)}
                              >
                          {person}
                                <svg className="ml-2 w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                          ))}
                        </div>
                      </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Due Date
                  </label>
                  <input
                      name="dueDate"
                      value={form.dueDate}
                      onChange={handleChange}
                      type="date"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-slate-50/50 hover:bg-white"
                      required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
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
            </div>

            {/* Success Message */}
            {submitted && (
                <div className="mx-8 mb-8 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Task created successfully!</p>
                      <p className="text-green-600 text-sm">The form will reset automatically.</p>
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