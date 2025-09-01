import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTaskContext } from "../context/TaskContext";
import { Bell, Settings, User, LogOut, Menu, X } from "lucide-react";

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

    // Get user data from localStorage
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
        console.log('Domain filter clicked:', domain);
        setMobileMenuOpen(false);
        selectDomainAndFilter(domain, navigate);
    };

    // Check if we're on dashboard or domain-specific dashboard pages
    const isDashboardPage = location.pathname === '/' ||
        location.pathname === '/dashboard' ||
        location.pathname.startsWith('/dashboard/');

    // Get task count using context or fallback to sample data
    const getTaskCount = (domain) => {
        try {
            return getTaskCountForDomain(domain, sampleTasks);
        } catch {
            if (domain === 'General') return sampleTasks.length;
            const mappedDomain = domain === 'Web Development' ? 'WebD' : domain;
            return sampleTasks.filter(task => task.domain === mappedDomain).length;
        }
    };

    // Get user initials
    const getUserInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle logout
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
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userData');
            navigate('/');
        }
    };

    // Close dropdown when clicking outside
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

    // **FIXED: Domain Button Component with Proper Colors**
    const DomainButton = ({ domain, index, isMobile = false }) => {
        const taskCount = getTaskCount(domain);
        const isSelected = isDomainSelected(domain) || isCurrentDomainRoute(domain);

        // **Static color mapping for each domain**
        const getDomainColors = (domainName) => {
            switch (domainName?.toLowerCase()) {
                case "web development":
                    return {
                        selected: "bg-indigo-100 text-indigo-600 border-indigo-200",
                        unselected: "bg-white text-neutral-600 border-neutral-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200",
                        badge: isSelected ? "bg-indigo-500 text-white" : "bg-neutral-100 text-neutral-500"
                    };
                case "graphic designing":
                case "graphic design":
                    return {
                        selected: "bg-amber-100 text-amber-600 border-amber-200",
                        unselected: "bg-white text-neutral-600 border-neutral-200 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200",
                        badge: isSelected ? "bg-amber-500 text-white" : "bg-neutral-100 text-neutral-500"
                    };
                case "video editing":
                    return {
                        selected: "bg-emerald-100 text-emerald-600 border-emerald-200",
                        unselected: "bg-white text-neutral-600 border-neutral-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200",
                        badge: isSelected ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-500"
                    };
                case "content writing":
                    return {
                        selected: "bg-rose-100 text-rose-600 border-rose-200",
                        unselected: "bg-white text-neutral-600 border-neutral-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200",
                        badge: isSelected ? "bg-rose-500 text-white" : "bg-neutral-100 text-neutral-500"
                    };
                case "general":
                default:
                    return {
                        selected: "bg-neutral-200 text-neutral-700 border-neutral-300",
                        unselected: "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-700 hover:border-neutral-300",
                        badge: isSelected ? "bg-neutral-500 text-white" : "bg-neutral-100 text-neutral-500"
                    };
            }
        };

        const colors = getDomainColors(domain);

        return (
            <button
                type="button"
                className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 border whitespace-nowrap ${
                    isMobile ? 'w-full justify-between' : ''
                } ${
                    isSelected ? colors.selected : colors.unselected
                } flex items-center shadow-sm`}
                onClick={() => handleDomainFilter(domain)}
            >
                <span>{domain}</span>
                <span className={`ml-3 px-3 py-1 rounded-lg text-xs font-bold ${colors.badge}`}>
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

        return (
            <button
                type="button"
                className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-250 border whitespace-nowrap ${
                    isMobile ? 'w-full justify-between' : ''
                } ${
                    isSelected
                        ? 'bg-indigo-100 text-indigo-600 border-indigo-200 shadow-sm'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 shadow-sm'
                } flex items-center`}
                onClick={() => {
                    setSelectedDomain(`filter:${filter}`);
                    setMobileMenuOpen(false);
                }}
            >
                <span>{label}</span>
                <span className={`ml-3 px-3 py-1 rounded-lg text-xs font-bold ${
                    isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-neutral-100 text-neutral-500'
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
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 group"
                            onClick={() => selectDomainAndFilter('General', navigate)}
                        >
                            <img src={"/edc.svg"} alt="logo" className="h-10 sm:h-12" />
                            <h1 className="text-xl sm:text-2xl font-bold text-neutral-700 group-hover:text-indigo-600 transition-colors duration-250 hidden xs:block">
                                Task Dashboard
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Domain Filter Buttons */}
                    {isDashboardPage && (
                        <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
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
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Mobile Menu Button */}
                        {isDashboardPage && (
                            <button
                                id="mobile-menu-button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-3 text-neutral-500 hover:text-neutral-600 hover:bg-neutral-100 rounded-xl transition-all duration-250"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}

                        {/* User Profile */}
                        <div className="relative" id="user-dropdown">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl px-4 py-3 border border-neutral-200 transition-all duration-250 hover:shadow-sm"
                            >
                                <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-xl object-cover" />
                                    ) : (
                                        getUserInitials(user.name)
                                    )}
                                </div>

                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-neutral-700">{user.name}</p>
                                    <p className="text-xs text-neutral-500">{user.role}</p>
                                </div>

                                <svg
                                    className={`w-4 h-4 text-neutral-400 transition-transform duration-250 hidden sm:block ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-surface rounded-xl shadow-xl border border-neutral-200 py-3 z-50">
                                    <div className="px-5 py-4 border-b border-neutral-200">
                                        <p className="text-sm font-semibold text-neutral-700">{user.name}</p>
                                        <p className="text-xs text-neutral-500 mt-1">{user.email}</p>
                                        <p className="text-xs text-indigo-600 font-semibold mt-1">{user.role}</p>
                                    </div>

                                    {/* Admin Dashboard Link */}
                                    {user.isAdmin && (
                                        <div className="py-2 border-b border-neutral-200">
                                            <Link
                                                to="/admin"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 w-full px-5 py-3 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors duration-250 rounded-lg mx-2"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Admin Dashboard
                                            </Link>
                                        </div>
                                    )}

                                    {/* Logout Button */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full px-5 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors duration-250 rounded-lg mx-2"
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
