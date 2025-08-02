import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useTaskContext } from "../context/TaskContext";
import { Bell, Settings, User, LogOut, Menu, X } from "lucide-react";

const Navbar = () => {
    const {
        selectedDomain,
        selectDomainAndFilter,
        domains,
        getTaskCountForDomain,
        isDomainSelected,
        isCurrentDomainRoute
    } = useTaskContext();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Mock user data
    const user = {
        name: "Arghajit Saha",
        email: "arghajitsaha8@gmail.com",
        role: "Junior Coordinator",
        avatar: null
    };

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

        // Close mobile menu when domain is selected
        setMobileMenuOpen(false);

        // Use the context filtering function with navigation
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
            // Fallback calculation
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
    const handleLogout = () => {
        console.log('User logged out');
        alert('Logout functionality - implement your auth logic here');
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

    // Domain Button Component for reusability
    const DomainButton = ({ domain, index, isMobile = false }) => {
        const taskCount = getTaskCount(domain);
        const isSelected = isDomainSelected(domain) || isCurrentDomainRoute(domain);

        const colors = [
            'bg-green-100 text-green-700 border-green-200 shadow-sm',
            'bg-purple-100 text-purple-700 border-purple-200 shadow-sm',
            'bg-pink-100 text-pink-700 border-pink-200 shadow-sm',
            'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
        ];

        const badgeColors = [
            'bg-green-200 text-green-800',
            'bg-purple-200 text-purple-800',
            'bg-pink-200 text-pink-800',
            'bg-orange-200 text-orange-800'
        ];

        const hoverColors = [
            'hover:bg-green-50 hover:border-green-100',
            'hover:bg-purple-50 hover:border-purple-100',
            'hover:bg-pink-50 hover:border-pink-100',
            'hover:bg-orange-50 hover:border-orange-100'
        ];

        return (
            <button
                type="button"
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
                    isMobile ? 'w-full justify-between' : ''
                } ${
                    isSelected
                        ? (domain === 'General' ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm' : colors[index])
                        : `bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:shadow-sm ${domain !== 'General' ? hoverColors[index] : ''}`
                } flex items-center`}
                onClick={() => handleDomainFilter(domain)}
            >
                <span>{domain}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    isSelected
                        ? (domain === 'General' ? 'bg-blue-200 text-blue-800' : badgeColors[index])
                        : 'bg-gray-200 text-gray-600'
                }`}>
                    {taskCount}
                </span>
            </button>
        );
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title Section */}
                    <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-2 sm:gap-3 group"
                            onClick={() => selectDomainAndFilter('General', navigate)}
                        >
                            <img src={"/edc.svg"} alt="logo" className="h-8 sm:h-12 w-auto" />
                            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200 hidden xs:block">
                                Task Dashboard
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Domain Filter Buttons - Only show on dashboard and larger screens */}
                    {isDashboardPage && (
                        <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
                            {/* General Button */}
                            <DomainButton domain="General" index={-1} />

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
                                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        )}

                        {/* User Profile */}
                        <div className="relative" id="user-dropdown">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 sm:gap-3 bg-gray-50 hover:bg-gray-100 rounded-lg px-2 sm:px-3 py-2 border border-gray-200 transition-all duration-200 hover:shadow-sm"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        getUserInitials(user.name)
                                    )}
                                </div>

                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
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
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                        <p className="text-xs text-blue-600 font-medium">{user.role}</p>
                                    </div>

                                    {/* Only Logout Button */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
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

                {/* Mobile Domain Filter Menu - Only show on dashboard pages */}
                {isDashboardPage && mobileMenuOpen && (
                    <div id="mobile-menu" className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700 mb-3">Filter by Domain</p>

                            {/* General Button Mobile */}
                            <DomainButton domain="General" index={-1} isMobile />

                            {/* Domain Buttons Mobile */}
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
