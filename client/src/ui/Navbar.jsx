import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTaskContext } from "../context/TaskContext";
import { Settings, LogOut, Menu, X, Shield, User as UserIcon } from "lucide-react";

const Navbar = () => {
    const {
        selectedDomain,
        setSelectedDomain,
        selectDomainAndFilter,
        domains,
        getTaskCountForDomain,
        tasks,
        getCurrentUser,
    } = useTaskContext();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = getCurrentUser() || { name: "Guest", email: "guest@example.com", role: "User" };

    const handleFilterClick = (domain) => {
        setMobileMenuOpen(false);
        selectDomainAndFilter(domain, navigate);
    };

    const handleUserFilterClick = (filter) => {
        setMobileMenuOpen(false);
        setSelectedDomain(`filter:${filter}`);
    };

    const isDashboardPage = location.pathname.startsWith('/dashboard');

    const getInitials = (name) => name ? name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) : 'GU';

    const handleLogout = async () => {
        // ... (logout logic remains the same)
        localStorage.clear();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownOpen && !event.target.closest("#user-dropdown")) setDropdownOpen(false);
            if (mobileMenuOpen && !event.target.closest("#mobile-menu") && !event.target.closest("#mobile-menu-button")) setMobileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dropdownOpen, mobileMenuOpen]);

    // --- Generic Filter Button for the new theme ---
    const FilterButton = ({ label, filter, isSelected, taskCount, isMobile }) => {
        const onClick = () => {
            if (filter.startsWith('filter:')) {
                handleUserFilterClick(filter.replace('filter:', ''));
            } else {
                handleFilterClick(filter);
            }
        };

        return (
            <button
                onClick={onClick}
                className={`flex items-center justify-between text-sm px-3 py-1.5 rounded-md transition-colors duration-200 whitespace-nowrap ${
                    isMobile ? 'w-full' : ''
                } ${
                    isSelected
                        ? 'bg-surface text-text-primary font-semibold'
                        : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                }`}
            >
                <span>{label}</span>
                {typeof taskCount === 'number' && (
                    <span className="ml-2 bg-border text-text-secondary text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {taskCount}
                    </span>
                )}
            </button>
        );
    };

    const allFilters = [
        { label: 'All Tasks', filter: 'General' },
        { label: 'My Tasks', filter: 'filter:assigned' },
        { label: 'Created By Me', filter: 'filter:created' },
        ...domains.map(d => ({ label: d, filter: d }))
    ];

    return (
        <nav className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
            <div className="max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Title Section */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => handleFilterClick('General')}>
                            <img src={"/edc_dark.png"} alt="logo" className="h-10 w-auto" />
                            <h1 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors hidden sm:block">
                                Task Bucket
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Domain Filter Buttons */}
                    {isDashboardPage && (
                        <div className="hidden lg:flex items-center gap-2">
                            {allFilters.map(({ label, filter }) => (
                                <FilterButton
                                    key={filter}
                                    label={label}
                                    filter={filter}
                                    isSelected={selectedDomain === filter}
                                    taskCount={getTaskCountForDomain(filter, tasks)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Right Section: Mobile Menu Button + Profile */}
                    <div className="flex items-center gap-4">
                        {isDashboardPage && (
                            <button id="mobile-menu-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md">
                                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        )}

                        <div className="relative" id="user-dropdown">
                            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface transition-colors">
                                <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center text-text-secondary font-bold text-sm">
                                    {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" /> : getInitials(user.name)}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                                    <p className="text-xs text-text-secondary">{user.role}</p>
                                </div>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl shadow-soft-xl border border-border py-2 z-50">
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                                        <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        {user.isAdmin && (
                                            <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-text-primary hover:bg-border transition-colors">
                                                <Shield size={16} className="text-text-secondary" /> Admin Panel
                                            </Link>
                                        )}
                                    </div>
                                    <div className="py-1">
                                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/50 transition-colors">
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Domain Filter Menu */}
            {isDashboardPage && mobileMenuOpen && (
                <div id="mobile-menu" className="lg:hidden border-t border-border p-4 space-y-2">
                    {allFilters.map(({ label, filter }) => (
                        <FilterButton
                            key={filter}
                            label={label}
                            filter={filter}
                            isSelected={selectedDomain === filter}
                            taskCount={getTaskCountForDomain(filter, tasks)}
                            isMobile
                        />
                    ))}
                </div>
            )}
        </nav>
    );
};

export default Navbar;