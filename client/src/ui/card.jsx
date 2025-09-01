import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    AlertCircle,
    Monitor,
    Palette,
    Video,
    PenTool,
    ArrowRight,
    ChevronRight,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Lock,
    MoreHorizontal,
    Check,
    X,
} from "lucide-react";
import EditTaskModal from "../components/EditTaskModal";
import { fetchTaskPermissions, canUserEditTask } from "../utils/permissions";

const TaskCard = ({
                      task = {
                          id: 1,
                          title: "Complete project management project",
                          description:
                              "Create a basic and prototype for the project management application with task tracking and user management",
                          taskMaker: "abc",
                          assignedTo: "xyz",
                          createdAt: "2025-01-15T10:30:00Z",
                          dueDate: "2025-01-22T17:00:00Z",
                          priority: "high",
                          status: "in-progress",
                          domain: "WebD",
                      },
                      onUpdate,
                      onDelete,
                      onViewDetails,
                  }) => {
    const [showActions, setShowActions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [permissions, setPermissions] = useState(null);
    const [editData, setEditData] = useState({
        status: task.status || "todo",
        priority: task.priority || "medium",
    });

    // Fetch permissions when component mounts
    useEffect(() => {
        if (task?.id || task?._id) {
            fetchTaskPermissions(task.id || task._id)
                .then((perms) => {
                    setPermissions(perms);
                })
                .catch((err) => {
                    console.error("TaskCard: Failed to load permissions:", err);
                    setPermissions({
                        canEdit: false,
                        canUpdateStatus: true,
                    });
                });
        } else {
            setPermissions({
                canEdit: false,
                canUpdateStatus: true,
            });
        }
    }, [task?.id, task?._id]);

    // Update editData when task prop changes
    useEffect(() => {
        setEditData({
            status: task.status || "todo",
            priority: task.priority || "medium",
        });
    }, [task.status, task.priority]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showActions && !event.target.closest(".action-dropdown")) {
                setShowActions(false);
            }
        };

        if (showActions) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => {
                document.removeEventListener("mousedown", handleClickOutside);
            };
        }
    }, [showActions]);

    const getDomainColor = (domain) => {
        switch (domain?.toLowerCase()) {
            case "graphic designing":
            case "graphic design":
                return {
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                    dot: "bg-amber-500",
                    accent: "bg-amber-500"
                };
            case "webd":
            case "web development":
            case "web dev":
                return {
                    bg: "bg-indigo-50",
                    text: "text-indigo-600",
                    dot: "bg-indigo-500",
                    accent: "bg-indigo-500"
                };
            case "video editing":
                return {
                    bg: "bg-emerald-50",
                    text: "text-emerald-600",
                    dot: "bg-emerald-500",
                    accent: "bg-emerald-500"
                };
            case "content writing":
                return {
                    bg: "bg-rose-50",
                    text: "text-rose-600",
                    dot: "bg-rose-500",
                    accent: "bg-rose-500"
                };
            default:
                return {
                    bg: "bg-neutral-100",
                    text: "text-neutral-500",
                    dot: "bg-neutral-400",
                    accent: "bg-neutral-400"
                };
        }
    };

    const getDomainDisplayName = (domain) => {
        switch (domain?.toLowerCase()) {
            case "webd":
                return "Web Development";
            case "graphic designing":
            case "graphic design":
                return "Graphic Design";
            case "video editing":
                return "Video Editing";
            case "content writing":
                return "Content Writing";
            default:
                return domain || "General";
        }
    };

    const getDomainIcon = (domain) => {
        switch (domain?.toLowerCase()) {
            case "graphic designing":
            case "graphic design":
                return <Palette className="w-5 h-5 flex-shrink-0" />;
            case "webd":
            case "web development":
            case "web dev":
                return <Monitor className="w-5 h-5 flex-shrink-0" />;
            case "video editing":
                return <Video className="w-5 h-5 flex-shrink-0" />;
            case "content writing":
                return <PenTool className="w-5 h-5 flex-shrink-0" />;
            default:
                return null;
        }
    };

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case "completed":
            case "accepted":
                return {
                    bg: "bg-emerald-50",
                    text: "text-emerald-600",
                    dot: "bg-emerald-500",
                    border: "border-emerald-200"
                };
            case "in-progress":
                return {
                    bg: "bg-indigo-50",
                    text: "text-indigo-600",
                    dot: "bg-indigo-500",
                    border: "border-indigo-200"
                };
            case "pending":
            case "todo":
                return {
                    bg: "bg-amber-50",
                    text: "text-amber-600",
                    dot: "bg-amber-500",
                    border: "border-amber-200"
                };
            case "overdue":
            case "declined":
                return {
                    bg: "bg-rose-50",
                    text: "text-rose-600",
                    dot: "bg-rose-500",
                    border: "border-rose-200"
                };
            default:
                return {
                    bg: "bg-neutral-100",
                    text: "text-neutral-500",
                    dot: "bg-neutral-400",
                    border: "border-neutral-200"
                };
        }
    };

    const getPriorityAccent = (priority) => {
        switch (priority?.toLowerCase()) {
            case "high":
                return "border-l-rose-500 border-l-4";
            case "medium":
                return "border-l-amber-500 border-l-4";
            case "low":
                return "border-l-emerald-500 border-l-4";
            default:
                return "border-l-neutral-300 border-l-4";
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "No date set";
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isOverdue = (dueDate) => {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    };

    const domainColors = getDomainColor(task.domain);
    const statusConfig = getStatusConfig(task.status);
    const priorityAccent = getPriorityAccent(task.priority);

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // **FIXED: Updated avatar colors to use modern color scheme**
    const getAvatarColor = (index, isCreator = false) => {
        if (isCreator) return "bg-indigo-500";

        const colors = [
            "bg-emerald-500",    // Modern emerald green
            "bg-amber-500",      // Modern amber orange
            "bg-rose-500",       // Modern rose red
            "bg-indigo-600",     // Darker indigo
            "bg-emerald-600"     // Darker emerald
        ];
        return colors[index % colors.length];
    };

    return (
        <div
            className={`bg-surface rounded-xl shadow-md border border-neutral-200 ${priorityAccent} p-8 cursor-pointer relative min-h-[280px] flex flex-col overflow-hidden`}
            onClick={() => onViewDetails?.(task)}
        >
            {/* Actions Menu */}
            <div className="absolute top-6 right-6 z-10 flex-shrink-0">
                <div className="relative action-dropdown">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowActions(!showActions);
                        }}
                        className="p-2.5 rounded-lg text-neutral-400 bg-neutral-50 border border-neutral-200 flex-shrink-0"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showActions && (
                        <div className="absolute right-0 top-full mt-3 bg-surface rounded-xl shadow-xl border border-neutral-200 py-3 z-20 min-w-[170px]">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetails?.(task);
                                    setShowActions(false);
                                }}
                                className="w-full px-5 py-3 text-left text-sm bg-surface flex items-center gap-3 text-neutral-600"
                            >
                                <Eye className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                <span className="truncate">View Details</span>
                            </button>
                            {canUserEditTask(permissions) && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowEditModal(true);
                                            setShowActions(false);
                                        }}
                                        className="w-full px-5 py-3 text-left text-sm bg-surface flex items-center gap-3 text-neutral-600"
                                    >
                                        <Edit3 className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                                        <span className="truncate">Edit Task</span>
                                    </button>
                                    <div className="mx-5 my-2 border-t border-neutral-200"></div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this task?")) {
                                                onDelete?.(task.id || task._id);
                                            }
                                            setShowActions(false);
                                        }}
                                        className="w-full px-5 py-3 text-left text-sm bg-surface flex items-center gap-3 text-rose-600"
                                    >
                                        <Trash2 className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">Delete Task</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Domain Header */}
            <div className="flex items-center gap-3 mb-6 min-w-0 pr-16">
                <div className={`p-3 rounded-xl ${domainColors.bg} border ${domainColors.border || 'border-neutral-200'} flex-shrink-0`}>
                    <div className={domainColors.text}>
                        {getDomainIcon(task.domain)}
                    </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <span className={`text-sm font-semibold ${domainColors.text} truncate`}>
                        {getDomainDisplayName(task.domain)}
                    </span>
                    <span className="text-xs text-neutral-400 mt-0.5">Domain</span>
                </div>
            </div>

            {/* Task Content */}
            <div className="flex-grow mb-6 min-w-0">
                <h3 className="text-xl font-bold text-neutral-700 leading-tight mb-4 pr-12 break-words">
                    {task.title}
                </h3>
                {task.description && (
                    <p className="text-neutral-500 text-sm leading-relaxed line-clamp-3 break-words">
                        {task.description}
                    </p>
                )}
            </div>

            {/* Assignment Section - Split Creator and Assignees */}
            <div className="mb-6">
                <div className="bg-neutral-50 rounded-xl p-5 border border-neutral-200 overflow-hidden">
                    {/* Creator and Assignee Info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-left">
                            <p className="text-sm font-semibold text-neutral-700 truncate" title={task.taskMakerName}>
                                {task.taskMakerName || "Unknown"}
                            </p>
                            <p className="text-xs text-neutral-400">Creator</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-neutral-700 truncate" title={
                                task.assignedToName && Array.isArray(task.assignedToName) && task.assignedToName.length > 0
                                    ? task.assignedToName.join(", ")
                                    : "Unassigned"
                            }>
                                {task.assignedToName && Array.isArray(task.assignedToName) && task.assignedToName.length > 0
                                    ? task.assignedToName[0] + (task.assignedToName.length > 1 ? ` +${task.assignedToName.length - 1}` : '')
                                    : "Unassigned"}
                            </p>
                            <p className="text-xs text-neutral-400">Assignee</p>
                        </div>
                    </div>

                    {/* Split Avatars - Creator Left, Assignees Right */}
                    <div className="flex items-center justify-between">
                        {/* Creator Avatar - Left Side */}
                        <div className="flex justify-start">
                            <div
                                className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-surface shadow-lg"
                                title={task.taskMakerName || "Creator"}
                            >
                                {getInitials(task.taskMakerName)}
                            </div>
                        </div>

                        {/* Assignee Avatars - Right Side */}
                        <div className="flex justify-end">
                            {task.assignedToName && Array.isArray(task.assignedToName) && task.assignedToName.length > 0 ? (
                                <div className="flex -space-x-2">
                                    {task.assignedToName.slice(0, 4).map((name, index) => (
                                        <div
                                            key={index}
                                            className={`w-12 h-12 ${getAvatarColor(index)} rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-surface shadow-lg relative`}
                                            style={{
                                                zIndex: 19 - index,
                                            }}
                                            title={name}
                                        >
                                            {getInitials(name)}
                                        </div>
                                    ))}
                                    {task.assignedToName.length > 4 && (
                                        <div
                                            className="w-12 h-12 bg-neutral-400 rounded-full flex items-center justify-center text-white font-bold text-xs border-3 border-surface shadow-lg relative"
                                            style={{ zIndex: 14 }}
                                            title={`${task.assignedToName.length - 4} more people`}
                                        >
                                            +{task.assignedToName.length - 4}
                                        </div>
                                    )}
                                </div>
                            ) : task.assignedToName && !Array.isArray(task.assignedToName) ? (
                                <div
                                    className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-3 border-surface shadow-lg"
                                    title={task.assignedToName}
                                >
                                    {getInitials(task.assignedToName)}
                                </div>
                            ) : (
                                <div
                                    className="w-12 h-12 bg-neutral-300 rounded-full flex items-center justify-center text-neutral-500 font-bold text-sm border-3 border-surface shadow-lg"
                                    title="Unassigned"
                                >
                                    ?
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Information */}
            <div className="flex items-center justify-between pt-5 border-t border-neutral-200 min-w-0 gap-4">
                {/* Due Date */}
                <div className="flex items-center gap-3 min-w-0 flex-shrink">
                    <div className={`p-2.5 rounded-lg ${isOverdue(task.dueDate) ? 'bg-rose-50' : 'bg-neutral-100'} flex-shrink-0`}>
                        <Clock className={`w-5 h-5 ${isOverdue(task.dueDate) ? "text-rose-500" : "text-neutral-500"}`} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Due Date</p>
                        <div className="flex items-center gap-2 mt-1">
                            <p className={`text-sm font-bold ${isOverdue(task.dueDate) ? "text-rose-600" : "text-neutral-700"} truncate`}>
                                {formatDate(task.dueDate)}
                            </p>
                            {isOverdue(task.dueDate) && (
                                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex-shrink-0`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.dot} flex-shrink-0`}></div>
                    <span className="capitalize tracking-wide whitespace-nowrap">{task.status}</span>
                </div>
            </div>

            {/* Edit Task Modal */}
            <EditTaskModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                task={task}
                permissions={permissions}
            />
        </div>
    );
};

export default TaskCard;
