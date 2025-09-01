import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTaskContext } from "../context/TaskContext";
import { Bell, Settings, User, LogOut, Menu, X, Shield } from "lucide-react";

const Navbar = () => {
    const {
        selectedDomain,
        setSelectedDomain,
        selectDomainAndFilter,
        domains,
        getTaskCountForDomain,
        isDomainSelected,
        isCurrentDomainRoute,
        tasks,
        getCurrentUser,
        fetchTasks
    } = useTaskContext();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const getUserData = () => {
        try {
            const userData = localStorage.getItem('userData');
            return userData ? JSON.parse(userData) : {
                name: "Guest User",
                email: "guest@example.com",
                role: "User",
                avatar: null
            };
        } catch (error) {
            console.error('Error parsing user data:', error);
            return {
                name: "Guest User",
                email: "guest@example.com",
                role: "User",
                avatar: null
            };
        }
    };

    const user = getUserData();

    // Sample tasks data for counting
    const sampleTasks = [
        { domain: "WebD", status: "in-progress" },
        { domain: "WebD", status: "completed" },
        { domain: "Graphic Designing", status: "overdue" },
        { domain: "Video Editing", status: "pending" },
        { domain: "Content Writing", status: "in-progress" },
        { domain: "Graphic Designing", status: "pending" }
    ];

    // Handle domain filtering with smooth animation and navigation
    const handleDomainFilter = (domain) => {
        setMobileMenuOpen(false);
        selectDomainAndFilter(domain, navigate);
    };

    const isDashboardPage = location.pathname === '/' ||
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/dashboard/');

    const getTaskCount = (domain) => {
        try {
            return getTaskCountForDomain(domain, sampleTasks);
        } catch {
            if (domain === 'General') return sampleTasks.length;
            const mappedDomain = domain === 'Web Development' ? 'WebD' : domain;
            return sampleTasks.filter(task => task.domain === mappedDomain).length;
        }
    };

    const getUserInitials = (name) => {
        if (!name) return 'GU';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');

            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            navigate('/');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('user-dropdown');
            const mobileMenu = document.getElementById('mobile-menu');

            if (dropdown && !dropdown.contains(event.target)) {
                setDropdownOpen(false);
            }

            if (mobileMenu && !mobileMenu.contains(event.target) && !event.target.closest('#mobile-menu-button')) {
                setMobileMenuOpen(false);
            }
        };

        if (dropdownOpen || mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, mobileMenuOpen]);

    // Domain Button Component for reusability
    const DomainButton = ({ domain, index, isMobile = false }) => {
        const taskCount = getTaskCount(domain);
        const isSelected = isDomainSelected(domain) || isCurrentDomainRoute(domain);

        const getColorClasses = () => {
            switch (domain) {
                case 'Graphic Designing':
                    return { bg: 'bg-badge-corporate/20', text: 'text-badge-corporate', border: 'border-badge-corporate/30', badgeBg: 'bg-badge-corporate/40', badgeText: 'text-badge-corporate' };
                case 'Web Development':
                    return { bg: 'bg-badge-public/20', text: 'text-badge-public', border: 'border-badge-public/30', badgeBg: 'bg-badge-public/40', badgeText: 'text-badge-public' };
                case 'Video Editing':
                    return { bg: 'bg-badge-service/20', text: 'text-badge-service', border: 'border-badge-service/30', badgeBg: 'bg-badge-service/40', badgeText: 'text-badge-service' };
                case 'Content Writing':
                    return { bg: 'bg-badge-entrepreneurial/20', text: 'text-badge-entrepreneurial', border: 'border-badge-entrepreneurial/30', badgeBg: 'bg-badge-entrepreneurial/40', badgeText: 'text-badge-entrepreneurial' };
                default:
                    return { bg: 'bg-badge-academic/20', text: 'text-badge-academic', border: 'border-badge-academic/30', badgeBg: 'bg-badge-academic/40', badgeText: 'text-badge-academic' };
            }
        };

        const classes = getColorClasses();

        return (
            <button
                type="button"
                className={`relative px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                    isMobile ? 'w-full justify-between' : ''
                } ${
                    isSelected
                        ? `${classes.bg} ${classes.text} border ${classes.border} shadow-card`
                        : `bg-bg-card-hover text-text-body hover:bg-bg-card-hover/80 border border-border-primary hover:shadow-card hover:${classes.border}`
                } flex items-center`}
                onClick={() => handleDomainFilter(domain)}
            >
                <span>{domain}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSelected
                        ? `${classes.badgeBg} ${classes.badgeText}`
                        : 'bg-bg-card text-text-muted'
                }`}>
                    {taskCount}
                </span>
            </button>
        );
    };

    // TaskFilterButton component for "My Tasks" and "Created Tasks"
    const TaskFilterButton = ({ filter, label, isMobile = false }) => {
        const [taskCount, setTaskCount] = useState(0);
        const currentUser = getCurrentUser();

        useEffect(() => {
            const calculateTaskCount = () => {
                if (!tasks || tasks.length === 0 || !currentUser) return 0;

                if (filter === 'assigned') {
                    const count = tasks.filter(task => {
                        if (Array.isArray(task.assignedTo)) {
                            return task.assignedTo.includes(currentUser._id) ||
                                task.assignedTo.includes(currentUser.id);
                        }
                        return task.assignedTo === currentUser._id ||
                            task.assignedTo === currentUser.id;
                    }).length;
                    return count;
                } else if (filter === 'created') {
                    const count = tasks.filter(task => {
                        return task.taskMaker === currentUser._id ||
                            task.taskMaker === currentUser.id;
                    }).length;
                    return count;
                }
                return 0;
            };

            const count = calculateTaskCount();
            setTaskCount(count);
        }, [tasks, filter, currentUser]);

        const isSelected = selectedDomain === `filter:${filter}`;

        const classes = {
            bg: 'bg-status-pending/20',
            text: 'text-status-pending',
            border: 'border-status-pending/30',
            badgeBg: 'bg-status-pending/40',
            badgeText: 'text-status-pending'
        };

        return (
            <button
                type="button"
                className={`relative px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                    isMobile ? 'w-full justify-between' : ''
                } ${
                    isSelected
                        ? `${classes.bg} ${classes.text} border ${classes.border} shadow-card`
                        : `bg-bg-card-hover text-text-body hover:bg-bg-card-hover/80 border border-border-primary hover:shadow-card hover:border-status-pending/20`
                } flex items-center`}
                onClick={() => {
                    setSelectedDomain(`filter:${filter}`);
                    setMobileMenuOpen(false);
                }}
            >
                <span>{label}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSelected
                        ? `${classes.badgeBg} ${classes.badgeText}`
                        : 'bg-bg-card text-text-muted'
                }`}>
                    {taskCount}
                </span>
            </button>
        );
    };

    return (
        <nav className="bg-surface border-b border-neutral-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm">
            <div className="max-w-full mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title Section */}
                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 sm:gap-3 group"
                            onClick={() => selectDomainAndFilter('General', navigate)}
                        >
                            <img src={"/edc.svg"} alt="logo" className="h-8 sm:h-18" />
                            <h1 className="text-lg sm:text-2xl font-semibold text-text-heading group-hover:text-badge-academic transition-colors duration-200 hidden xs:block">
                                Task Dashboard
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Domain Filter Buttons - Only show on dashboard and larger screens */}
                    {isDashboardPage && (
                        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                            {/* General Button */}
                            <DomainButton domain="General" index={-1} />

                            {/* My Tasks Button */}
                            <TaskFilterButton filter="assigned" label="My Tasks" />

                            {/* Created Tasks Button */}
                            <TaskFilterButton filter="created" label="Created Tasks" />

                            {/* Domain Buttons */}
                            {domains.map((domain, index) => (
                                <DomainButton key={domain} domain={domain} index={index} />
                            ))}
                        </div>
                    )}

                    {/* Right Section: Mobile Menu Button + Profile */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Mobile Menu Button - Only show on dashboard pages */}
                        {isDashboardPage && (
                            <button
                                id="mobile-menu-button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2 text-text-body hover:text-text-heading hover:bg-bg-card-hover rounded-2xl transition-all duration-200"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}

                        {/* User Profile */}
                        <div className="relative" id="user-dropdown">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 sm:gap-3 bg-bg-card-hover hover:bg-bg-card-hover/80 rounded-2xl px-2 sm:px-3 py-2 border border-border-primary transition-all duration-200 hover:shadow-card"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-badge-academic to-badge-academic/80 rounded-full flex items-center justify-center text-text-heading font-semibold text-sm">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        getUserInitials(user.name)
                                    )}
                                </div>

                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-medium text-text-heading">{user.name}</p>
                                    <p className="text-xs text-text-muted">{user.role}</p>
                                </div>

                                <svg
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown - Simplified with only logout */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-bg-card rounded-2xl shadow-card-hover border border-border-primary py-2 z-50">
                                    <div className="px-4 py-3 border-b border-border-primary">
                                        <p className="text-sm font-medium text-text-heading">{user.name}</p>
                                        <p className="text-xs text-text-muted">{user.email}</p>
                                        <p className="text-xs text-badge-academic font-medium">{user.role}</p>
                                    </div>

                                    {/* Admin Dashboard Link - Show only for admins */}
                                    {user.isAdmin && (
                                        <div className="py-2 border-b border-border-primary">
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-badge-academic hover:bg-badge-academic/10 transition-colors duration-150"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Admin Dashboard
                                            </Link>
                                        </div>
                                    )}

                                    {/* Only Logout Button */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-status-declined hover:bg-status-declined/10 transition-colors duration-150"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Domain Filter Menu */}
                {isDashboardPage && mobileMenuOpen && (
                    <div id="mobile-menu" className="lg:hidden mt-5 pb-4 border-t border-neutral-200 pt-5">
                        <div className="space-y-3">
                            <p className="text-sm font-semibold text-neutral-600 mb-4">Filter by Domain</p>

                            <DomainButton domain="General" index={-1} isMobile />
                            <TaskFilterButton filter="assigned" label="My Tasks" isMobile />
                            <TaskFilterButton filter="created" label="Created Tasks" isMobile />

                            {domains.map((domain, index) => (
                                <DomainButton key={domain} domain={domain} index={index} isMobile />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;