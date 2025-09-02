import React, { useState, useEffect } from "react";
import {
    Clock,
    Monitor,
    Palette,
    Video,
    PenTool,
    Edit3,
    Trash2,
    Eye,
    MoreHorizontal,
} from "lucide-react";
import EditTaskModal from "../components/EditTaskModal";
import { fetchTaskPermissions, canUserEditTask } from "../utils/permissions";

const TaskCard = ({
                      task = {
                          id: 1,
                          title: "Default Task Title",
                          description: "This is a sample description for the default task, demonstrating how text will wrap and display within the card.",
                          taskMakerName: "Ava Creator",
                          assignedToName: ["Liam Assignee", "Noah", "Olivia"],
                          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                          status: "in-progress",
                          domain: "Web Development",
                      },
                      onUpdate,
                      onDelete,
                      onViewDetails,
                  }) => {
    const [showActions, setShowActions] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [permissions, setPermissions] = useState(null);

    useEffect(() => {
        if (task?._id) {
            fetchTaskPermissions(task._id)
                .then(setPermissions)
                .catch(() => setPermissions({ canEdit: false, canUpdateStatus: true }));
        }
    }, [task?._id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showActions && !event.target.closest(".action-dropdown")) {
                setShowActions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showActions]);

    const getDomainConfig = (domain) => {
        const d = domain?.toLowerCase();
        if (d?.includes("web")) return { bg: "bg-blue-900/50", text: "text-blue-300", icon: <Monitor className="w-4 h-4" /> };
        if (d?.includes("design")) return { bg: "bg-amber-900/50", text: "text-amber-300", icon: <Palette className="w-4 h-4" /> };
        if (d?.includes("video")) return { bg: "bg-emerald-900/50", text: "text-emerald-300", icon: <Video className="w-4 h-4" /> };
        if (d?.includes("content")) return { bg: "bg-rose-900/50", text: "text-rose-300", icon: <PenTool className="w-4 h-4" /> };
        return { bg: "bg-zinc-800", text: "text-zinc-400", icon: null };
    };

    const getStatusConfig = (status) => {
        const s = status?.toLowerCase();
        if (s === "completed" || s === "accepted") return { bg: "bg-emerald-900/50", text: "text-emerald-300", dot: "bg-emerald-500", border: "border-emerald-800/50" };
        if (s === "in-progress") return { bg: "bg-blue-900/50", text: "text-blue-300", dot: "bg-blue-500", border: "border-blue-800/50" };
        if (s === "pending" || s === "todo") return { bg: "bg-amber-900/50", text: "text-amber-300", dot: "bg-amber-500", border: "border-amber-800/50" };
        if (s === "overdue" || s === "declined") return { bg: "bg-red-900/50", text: "text-red-300", dot: "bg-red-500", border: "border-red-800/50" };
        return { bg: "bg-zinc-800", text: "text-zinc-400", dot: "bg-zinc-600", border: "border-zinc-700" };
    };

    const getInitials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date set";
    const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date() && task.status !== 'completed';

    const domainConfig = getDomainConfig(task.domain);
    const statusConfig = getStatusConfig(task.status);
    const allAssignees = Array.isArray(task.assignedToName) ? task.assignedToName : [];

    return (
        <div
            className="bg-surface rounded-2xl shadow-soft-lg border border-border p-6 flex flex-col cursor-pointer transition-all duration-300 hover:border-neutral-700 hover:shadow-glow-primary relative group"
            onClick={() => onViewDetails?.(task)}
        >
            {/* Actions Menu */}
            <div className="absolute top-4 right-4 z-10">
                <div className="relative action-dropdown">
                    <button onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }} className="p-2 rounded-full text-text-secondary bg-background hover:bg-border transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    {showActions && (
                        <div className="absolute right-0 top-full mt-2 bg-surface rounded-xl shadow-soft-xl border border-border py-2 z-20 min-w-[180px]">
                            <button onClick={(e) => { e.stopPropagation(); onViewDetails?.(task); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-border">
                                <Eye className="w-4 h-4 text-text-secondary" /> View Details
                            </button>
                            {canUserEditTask(permissions) && (
                                <>
                                    <button onClick={(e) => { e.stopPropagation(); setShowEditModal(true); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-border">
                                        <Edit3 className="w-4 h-4 text-text-secondary" /> Edit Task
                                    </button>
                                    <div className="my-1 border-t border-border"></div>
                                    <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this task?")) onDelete?.(task._id); setShowActions(false); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-3 text-red-400 hover:bg-red-900/50">
                                        <Trash2 className="w-4 h-4" /> Delete Task
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Domain Header */}
            <div className="flex items-center gap-3 mb-4 pr-12">
                <div className={`p-2.5 rounded-lg ${domainConfig.bg}`}>
                    <div className={domainConfig.text}>{domainConfig.icon}</div>
                </div>
                <div>
                    <span className={`text-sm font-bold ${domainConfig.text}`}>{task.domain}</span>
                    <p className="text-xs text-text-secondary">Domain</p>
                </div>
            </div>

            {/* Task Content */}
            <div className="flex-grow mb-4">
                <h3 className="text-xl font-bold text-text-primary leading-tight group-hover:text-primary transition-colors">{task.title}</h3>
                {task.description && <p className="text-text-secondary text-sm mt-2 leading-relaxed line-clamp-2">{task.description}</p>}
            </div>

            {/* Assignment Section */}
            <div className="mb-6">
                <div className="bg-background rounded-lg p-4 border border-border">
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-left">
                            <p className="text-sm font-bold text-text-primary truncate" title={task.taskMakerName}>{task.taskMakerName || "Unknown"}</p>
                            <p className="text-xs text-text-secondary">Creator</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-text-primary truncate" title={allAssignees.join(", ")}>
                                {allAssignees.length > 0 ? `${allAssignees[0]}${allAssignees.length > 1 ? ` +${allAssignees.length - 1}` : ''}` : "Unassigned"}
                            </p>
                            <p className="text-xs text-text-secondary">Assignee(s)</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-surface" title={`Creator: ${task.taskMakerName}`}>
                            {getInitials(task.taskMakerName)}
                        </div>
                        {allAssignees.length > 0 && (
                            <div className="flex -space-x-2">
                                {allAssignees.slice(0, 3).map((name, index) => (
                                    <div key={index} className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-surface" title={`Assignee: ${name}`}>
                                        {getInitials(name)}
                                    </div>
                                ))}
                                {allAssignees.length > 3 && (
                                    <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-surface" title={`${allAssignees.length - 3} more`}>
                                        +{allAssignees.length - 3}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Information */}
            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOverdue(task.dueDate) ? 'bg-red-900/50' : 'bg-background'}`}>
                        <Clock className={`w-4 h-4 ${isOverdue(task.dueDate) ? "text-red-400" : "text-text-secondary"}`} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-text-secondary uppercase tracking-wide">Due</p>
                        <p className={`text-sm font-bold ${isOverdue(task.dueDate) ? "text-red-400" : "text-text-primary"}`}>{formatDate(task.dueDate)}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                    <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                    <span className="capitalize whitespace-nowrap">{task.status}</span>
                </div>
            </div>

            <EditTaskModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} task={task} permissions={permissions} />
        </div>
    );
};

export default TaskCard;