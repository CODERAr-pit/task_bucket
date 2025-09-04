import React from 'react';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';

const FilterAndSortBar = ({ 
    filters, 
    sortBy, 
    sortOrder, 
    onFilterChange, 
    onSortChange, 
    onClearFilters,
    taskCounts 
}) => {
    const statusOptions = [
        { value: 'all', label: 'All Status', count: taskCounts?.all || 0 },
        { value: 'todo', label: 'Todo', count: taskCounts?.todo || 0 },
        { value: 'in-progress', label: 'In Progress', count: taskCounts?.inProgress || 0 },
        { value: 'completed', label: 'Completed', count: taskCounts?.completed || 0 }
    ];

    const priorityOptions = [
        { value: 'all', label: 'All Priority' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    const sortOptions = [
        { value: 'dueDate', label: 'Due Date' },
        { value: 'createdAt', label: 'Created Date' },
        { value: 'priority', label: 'Priority' },
        { value: 'status', label: 'Status' }
    ];

    const hasActiveFilters = filters.status !== 'all' || filters.priority !== 'all' || filters.overdue !== 'all';

    return (
        <div className="bg-surface rounded-xl p-4 mb-6 border border-border shadow-soft">
            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {/* Status Filter */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Status
                    </label>
                    <div className="flex flex-wrap gap-1">
                        {statusOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onFilterChange('status', option.value)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1 ${
                                    filters.status === option.value
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-background border-border text-text-secondary hover:bg-border/50'
                                }`}
                            >
                                {option.label}
                                {option.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        filters.status === option.value
                                            ? 'bg-white/20'
                                            : 'bg-border text-text-primary'
                                    }`}>
                                        {option.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Priority
                    </label>
                    <select
                        value={filters.priority}
                        onChange={(e) => onFilterChange('priority', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        {priorityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Overdue Filter */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Due Status
                    </label>
                    <select
                        value={filters.overdue}
                        onChange={(e) => onFilterChange('overdue', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    >
                        <option value="all">All Tasks</option>
                        <option value="overdue">Overdue</option>
                        <option value="due-today">Due Today</option>
                        <option value="due-this-week">Due This Week</option>
                        <option value="upcoming">Upcoming</option>
                    </select>
                </div>

                {/* Sort Controls */}
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Sort By
                    </label>
                    <div className="flex gap-1">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value, sortOrder)}
                            className="flex-1 px-3 py-2 bg-background border border-border rounded-l-lg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-2 bg-background border border-l-0 border-border rounded-r-lg text-text-secondary hover:bg-border/50 hover:text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                        >
                            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Filters & Clear Button */}
            {hasActiveFilters && (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Filter size={14} />
                        <span>Filters applied:</span>
                        <div className="flex gap-1">
                            {filters.status !== 'all' && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
                                </span>
                            )}
                            {filters.priority !== 'all' && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    Priority: {priorityOptions.find(opt => opt.value === filters.priority)?.label}
                                </span>
                            )}
                            {filters.overdue !== 'all' && (
                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                                    Due: {filters.overdue.replace('-', ' ')}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-border/50 rounded-lg transition-all"
                    >
                        <X size={12} />
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};

export default FilterAndSortBar;
