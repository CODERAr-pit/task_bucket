import React from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  Monitor,
  Palette,
  Video,
  PenTool,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const TaskCard = ({
                    task = {
                      id: 1,
                      title: "Complete project management project",
                      description: "Create a basic and prototype for the project management application with task tracking and user management",
                      taskMaker: "abc",
                      assignedTo: "xyz",
                      createdAt: "2025-01-15T10:30:00Z",
                      dueDate: "2025-01-22T17:00:00Z",
                      priority: "high",
                      status: "in-progress",
                      domain: "WebD",
                    }
                  }) => {
  // Add a hoverBg for darker gradient shading per domain
  const getDomainColor = (domain) => {
    switch (domain?.toLowerCase()) {
      case 'graphic designing':
      case 'graphic design':
        return {
          bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
          hoverBg: 'bg-gradient-to-br from-purple-600 to-purple-700',
          text: 'text-white',
          light: 'bg-purple-50',
          border: 'border-purple-200'
        };
      case 'webd':
      case 'web development':
      case 'web dev':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
          hoverBg: 'bg-gradient-to-br from-blue-600 to-blue-700',
          text: 'text-white',
          light: 'bg-blue-50',
          border: 'border-blue-200'
        };
      case 'video editing':
        return {
          bg: 'bg-gradient-to-br from-red-500 to-red-600',
          hoverBg: 'bg-gradient-to-br from-red-600 to-red-700',
          text: 'text-white',
          light: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'content writing':
        return {
          bg: 'bg-gradient-to-br from-green-500 to-green-600',
          hoverBg: 'bg-gradient-to-br from-green-600 to-green-700',
          text: 'text-white',
          light: 'bg-green-50',
          border: 'border-green-200'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-500 to-gray-600',
          hoverBg: 'bg-gradient-to-br from-gray-600 to-gray-700',
          text: 'text-white',
          light: 'bg-gray-50',
          border: 'border-gray-200'
        };
    }
  };

  const getDomainDisplayName = (domain) => {
    switch (domain?.toLowerCase()) {
      case 'webd':
        return 'Web Development';
      case 'graphic designing':
      case 'graphic design':
        return 'Graphic Design';
      case 'video editing':
        return 'Video Editing';
      case 'content writing':
        return 'Content Writing';
      default:
        return domain || 'General';
    }
  };

  const getDomainIcon = (domain) => {
    switch (domain?.toLowerCase()) {
      case 'graphic designing':
      case 'graphic design':
        return <Palette className="w-4 h-4" />;
      case 'webd':
      case 'web development':
      case 'web dev':
        return <Monitor className="w-4 h-4" />;
      case 'video editing':
        return <Video className="w-4 h-4" />;
      case 'content writing':
        return <PenTool className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return {
          color: 'text-emerald-700 bg-emerald-100 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'in-progress':
        return {
          color: 'text-blue-700 bg-blue-100 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'pending':
        return {
          color: 'text-amber-700 bg-amber-100 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'overdue':
        return {
          color: 'text-red-700 bg-red-100 border-red-200',
          dot: 'bg-red-500'
        };
      default:
        return {
          color: 'text-gray-700 bg-gray-100 border-gray-200',
          dot: 'bg-gray-500'
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const domainColors = getDomainColor(task.domain);
  const statusConfig = getStatusConfig(task.status);

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // React state to track hovered state for the button
  const [isHover, setHover] = React.useState(false);

  return (
      <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden w-full mx-auto flex flex-col h-full">
        {/* Domain Header with Status beside it */}
        {task.domain && (
            <div className={`${domainColors.bg} px-4 py-3 flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    {getDomainIcon(task.domain)}
                  </div>
                  <h4 className={`font-semibold text-sm ${domainColors.text}`}>
                    {getDomainDisplayName(task.domain)}
                  </h4>
                </div>
                {task.status && (
                    <div className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-xs font-medium capitalize ${statusConfig.color} border-solid`}>
                      <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                      <span className="select-none">
                  {task.status.replace('-', ' ')}
                </span>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Main Content */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{task.title}</h3>
          {task.description && (
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {truncateText(task.description)}
              </p>
          )}

          {/* People Info */}
          <div className="mb-4 mt-auto px-1">
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {(task.taskMaker || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-xs">{task.taskMaker || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">Creator</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                  {(task.assignedTo || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-xs">{task.assignedTo || 'Unassigned'}</p>
                  <p className="text-xs text-gray-500">Assignee</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-row justify-between gap-3 px-3">
            {task.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-3 h-3 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Created</p>
                    <p className="font-medium text-gray-700 text-xs">{formatDate(task.createdAt)}</p>
                  </div>
                </div>
            )}
            {task.dueDate && (
                <div className="flex items-start gap-2">
                  <Clock className={`w-3 h-3 mt-0.5 ${isOverdue(task.dueDate) ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Due</p>
                    <div className="flex items-center gap-1">
                      <p className={`font-medium text-xs ${isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-700'}`}>
                        {formatDate(task.dueDate)}
                      </p>
                      {isOverdue(task.dueDate) && <AlertCircle className="w-3 h-3 text-red-500" />}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* Footer Action */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0 mt-auto">
          <button
              className={[
                isHover ? domainColors.hoverBg : domainColors.bg,
                domainColors.text,
                'w-full py-2 px-3 rounded-lg font-medium text-sm hover:shadow-md flex items-center justify-center gap-2'
              ].join(' ')}
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onClick={() => alert(`Viewing details for Task #${task.id}`)}
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
};

export default TaskCard;
