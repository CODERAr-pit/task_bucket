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
  const [hover, setHover] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [editData, setEditData] = useState({
    status: task.status || "todo",
    priority: task.priority || "medium",
  });

  // Fetch permissions when component mounts
  useEffect(() => {
    if (task?.id || task?._id) {
      console.log(
        "TaskCard: Fetching permissions for task:",
        task?.id || task?._id
      );
      fetchTaskPermissions(task.id || task._id)
        .then((perms) => {
          console.log("TaskCard: Task permissions loaded:", perms);
          setPermissions(perms);
        })
        .catch((err) => {
          console.error("TaskCard: Failed to load permissions:", err);
          // Set default permissions that allow status updates but not full editing
          setPermissions({
            canEdit: false,
            canUpdateStatus: true,
          });
        });
    } else {
      // If no task ID, set basic permissions
      setPermissions({
        canEdit: false,
        canUpdateStatus: true,
      });
    }
  }, [task?.id, task?._id]);

  // Debug modal state changes
  useEffect(() => {
    console.log("TaskCard - showEditModal changed:", showEditModal);
  }, [showEditModal]);

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
  // Add a hoverBg for darker gradient shading per domain
  const getDomainColor = (domain) => {
    switch (domain?.toLowerCase()) {
      case "graphic designing":
      case "graphic design":
        return {
          bg: "bg-badge-public",
          hoverBg: "bg-badge-public/90",
          text: "text-text-heading",
          light: "bg-badge-public/10",
          border: "border-badge-public/30",
        };
      case "webd":
      case "web development":
      case "web dev":
        return {
          bg: "bg-badge-academic",
          hoverBg: "bg-badge-academic/90",
          text: "text-text-heading",
          light: "bg-badge-academic/10",
          border: "border-badge-academic/30",
        };
      case "video editing":
        return {
          bg: "bg-badge-service",
          hoverBg: "bg-badge-service/90",
          text: "text-text-heading",
          light: "bg-badge-service/10",
          border: "border-badge-service/30",
        };
      case "content writing":
        return {
          bg: "bg-badge-corporate",
          hoverBg: "bg-badge-corporate/90",
          text: "text-text-heading",
          light: "bg-badge-corporate/10",
          border: "border-badge-corporate/30",
        };
      default:
        return {
          bg: "bg-badge-entrepreneurial",
          hoverBg: "bg-badge-entrepreneurial/90",
          text: "text-text-heading",
          light: "bg-badge-entrepreneurial/10",
          border: "border-badge-entrepreneurial/30",
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
        return <Palette className="w-4 h-4" />;
      case "webd":
      case "web development":
      case "web dev":
        return <Monitor className="w-4 h-4" />;
      case "video editing":
        return <Video className="w-4 h-4" />;
      case "content writing":
        return <PenTool className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "accepted":
        return {
          color: "text-status-accepted bg-status-accepted/20 border-status-accepted/30",
          dot: "bg-status-accepted",
        };
      case "in-progress":
        return {
          color: "text-status-pending bg-status-pending/20 border-status-pending/30",
          dot: "bg-status-pending",
        };
      case "pending":
        return {
          color: "text-status-pending bg-status-pending/20 border-status-pending/30",
          dot: "bg-status-pending",
        };
      case "overdue":
      case "declined":
        return {
          color: "text-status-declined bg-status-declined/20 border-status-declined/30",
          dot: "bg-status-declined",
        };
      default:
        return {
          color: "text-text-muted bg-bg-card border-border-primary",
          dot: "bg-text-muted",
        };
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

  const truncateText = (text, maxLength = 80) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // React state to track hovered state for the button
  const [isHover, setIsHover] = useState(false);

  return (
    <div className="group bg-bg-card hover:bg-bg-card-hover rounded-2xl shadow-card hover:shadow-card-hover border border-border-primary overflow-hidden w-full mx-auto flex flex-col h-full transition-all duration-200">
      {/* Domain Header with Status and Actions */}
      {task.domain && (
        <div className={`${domainColors.bg} px-4 py-3 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-bg-primary/20 rounded-lg backdrop-blur-sm">
                {getDomainIcon(task.domain)}
              </div>
              <h4 className={`font-semibold text-sm text-text-heading`}>
                {getDomainDisplayName(task.domain)}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              {/* Status Display or Edit */}
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      setEditData({ ...editData, status: e.target.value })
                    }
                    className="text-xs px-2 py-1 rounded-2xl border bg-bg-card/90 text-text-body border-border-primary"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={async () => {
                      console.log(
                        "Updating task:",
                        task.id || task._id,
                        "with data:",
                        editData
                      );
                      try {
                        await onUpdate?.(task.id || task._id, editData);
                        console.log("Task update successful");
                        setIsEditing(false);
                      } catch (error) {
                        console.error("Error updating task:", error);
                        // Don't close editing mode on error
                      }
                    }}
                    className="p-1 rounded bg-status-accepted/20 text-status-accepted hover:bg-status-accepted/30"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="p-1 rounded bg-status-declined/20 text-status-declined hover:bg-status-declined/30"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  {task.status && (
                    <div
                      className={`flex items-center gap-1 rounded-2xl border px-3 py-1 text-xs font-medium capitalize ${statusConfig.color} border-solid`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${statusConfig.dot}`}
                      ></div>
                      <span className="select-none">{task.status}</span>
                    </div>
                  )}

                  {/* Visibility Indicator */}
                  {task.visibility === "private" && (
                    <div className="flex items-center gap-1 rounded-2xl border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-50">
                      <Lock className="w-3 h-3" />
                      <span className="select-none">Private</span>
                    </div>
                  )}

                  {/* Action Dropdown */}
                  <div className="relative action-dropdown">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-1 rounded-2xl bg-bg-primary/20 text-text-heading hover:bg-bg-primary/30 transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {showActions && (
                      <div className="absolute right-0 top-full mt-1 bg-bg-card rounded-2xl shadow-card-hover border border-border-primary py-1 z-10 min-w-[120px]">
                        <button
                          onClick={() => {
                            onViewDetails?.(task);
                            setShowActions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-bg-card-hover flex items-center gap-2 text-text-body"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button>
                        {/* <button
                          onClick={() => onViewDetails?.(task)}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                        >
                          <Eye className="w-3 h-3" />
                          View Details
                        </button> */}
                        {/* Always show edit button for now to test functionality */}
                        <button
                          onClick={() => {
                            console.log(
                              "Edit button clicked, opening modal for task:",
                              task
                            );
                            setShowEditModal(true);
                            setShowActions(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-bg-card-hover flex items-center gap-2 text-text-body"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit Task
                        </button>
                        {/* Original permissions-based edit button */}
                        {/* {(() => {
                          const canEdit = canUserEditTask(permissions);
                          console.log(
                            "TaskCard: Can user edit task?",
                            canEdit,
                            "permissions:",
                            permissions
                          );
                          return canEdit;
                        })() && (
                          <button
                            onClick={() => {
                              console.log(
                                "Edit button clicked, opening modal for task:",
                                task
                              );
                              setShowEditModal(true);
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit Task
                          </button>
                        )} */}
                        {canUserEditTask(permissions) && (
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this task?"
                                )
                              ) {
                                onDelete?.(task.id || task._id);
                              }
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-status-declined/10 flex items-center gap-2 text-status-declined"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-text-heading leading-tight flex-1">
            {task.title}
          </h3>
          {task.visibility === 'private' && (
            <div className="ml-2 mt-1" title="Private Task - Only visible to you and assignees">
              <EyeOff className="w-4 h-4 text-amber-400" />
            </div>
          )}
        </div>
        {task.description && (
          <p className="text-text-body text-sm mb-4 leading-relaxed">
            {truncateText(task.description)}
          </p>
        )}

        {/* People Info */}
        <div className="mb-4 mt-auto px-1">
          <div className="flex items-center justify-between bg-bg-card-hover/50 border border-border-primary rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-text-muted to-text-body rounded-full flex items-center justify-center text-text-heading font-semibold text-xs">
                {(task.taskMakerName || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-text-heading text-xs">
                  {task.taskMakerName || "Unknown"}
                </p>
                <p className="text-xs text-text-muted">Creator</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted mx-1" />
            <div className="flex items-center gap-2">
              {/* Handle multiple assignees */}
              {task.assignedToName && Array.isArray(task.assignedToName) ? (
                task.assignedToName.length > 0 ? (
                  <>
                    {task.assignedToName.length === 1 ? (
                      // Single assignee
                      <>
                        <div className="w-8 h-8 bg-gradient-to-br from-badge-academic to-badge-academic/80 rounded-full flex items-center justify-center text-text-heading font-semibold text-xs">
                          {task.assignedToName[0].charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-heading text-xs">
                            {task.assignedToName[0]}
                          </p>
                          <p className="text-xs text-text-muted">Assignee</p>
                        </div>
                      </>
                    ) : (
                      // Multiple assignees
                      <>
                        <div className="flex -space-x-2">
                          {task.assignedToName
                            .slice(0, 3)
                            .map((name, index) => (
                              <div
                                key={index}
                                className="w-8 h-8 bg-gradient-to-br from-badge-academic to-badge-academic/80 rounded-full flex items-center justify-center text-text-heading font-semibold text-xs border-2 border-bg-card"
                                title={name}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          {task.assignedToName.length > 3 && (
                            <div className="w-8 h-8 bg-gradient-to-br from-text-muted to-text-body rounded-full flex items-center justify-center text-text-heading font-semibold text-xs border-2 border-bg-card">
                              +{task.assignedToName.length - 3}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-text-heading text-xs">
                            {task.assignedToName.length === 2
                              ? task.assignedToName.join(" & ")
                              : `${task.assignedToName[0]} & ${
                                  task.assignedToName.length - 1
                                } others`}
                          </p>
                          <p className="text-xs text-text-muted">
                            Assignees ({task.assignedToName.length})
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  // No assignees
                  <>
                    <div className="w-8 h-8 bg-gradient-to-br from-text-muted to-text-body rounded-full flex items-center justify-center text-text-heading font-semibold text-xs">
                      U
                    </div>
                    <div>
                      <p className="font-medium text-text-heading text-xs">
                        Unassigned
                      </p>
                      <p className="text-xs text-text-muted">Assignee</p>
                    </div>
                  </>
                )
              ) : (
                // Fallback for non-array or missing data
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-badge-academic to-badge-academic/80 rounded-full flex items-center justify-center text-text-heading font-semibold text-xs">
                    {(task.assignedToName && Array.isArray(task.assignedToName) && task.assignedToName.length > 0 
                      ? task.assignedToName[0] 
                      : "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-text-heading text-xs">
                      {task.assignedToName && Array.isArray(task.assignedToName) && task.assignedToName.length > 0
                        ? task.assignedToName[0]
                        : "Unassigned"}
                    </p>
                    <p className="text-xs text-text-muted">Assignee</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-row justify-between gap-3 px-3">
          {task.createdAt && (
            <div className="flex items-start gap-2">
              <Calendar className="w-3 h-3 text-text-muted mt-0.5" />
              <div>
                <p className="text-xs text-text-muted mb-0.5">Created</p>
                <p className="font-medium text-text-body text-xs">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-start gap-2">
              <Clock
                className={`w-3 h-3 mt-0.5 ${
                  isOverdue(task.dueDate) ? "text-status-declined" : "text-status-pending"
                }`}
              />
              <div>
                <p className="text-xs text-text-muted mb-0.5">Due</p>
                <div className="flex items-center gap-1">
                  <p
                    className={`font-medium text-xs ${
                      isOverdue(task.dueDate) ? "text-status-declined" : "text-text-body"
                    }`}
                  >
                    {formatDate(task.dueDate)}
                  </p>
                  {isOverdue(task.dueDate) && (
                    <AlertCircle className="w-3 h-3 text-status-declined" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-4 py-3 bg-bg-card-hover/30 border-t border-border-primary flex-shrink-0 mt-auto">
        {/* <button
          className={[
            isHover ? domainColors.hoverBg : domainColors.bg,
            domainColors.text,
            "w-full py-2 px-3 rounded-2xl font-medium text-sm hover:shadow-card flex items-center justify-center gap-2 transition-all duration-200",
          ].join(" ")}
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          onClick={() => onViewDetails?.(task)}
        >
          <Eye className="w-4 h-4" />
          View Details
          <ArrowRight className="w-4 h-4" />
        </button> */}
      </div>

      {/* Edit Task Modal */}
      {console.log(
        "TaskCard - Rendering EditTaskModal with showEditModal:",
        showEditModal,
        "task:",
        task
      )}
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
