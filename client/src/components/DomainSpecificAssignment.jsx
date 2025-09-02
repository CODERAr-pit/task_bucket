import React, { useState, useEffect } from 'react';
import { Users, Filter, ChevronDown, Check, X, Search } from 'lucide-react';

const DomainSpecificAssignment = ({ selectedUsers = [], onUsersChange, className = "" }) => {
    const [filterMode, setFilterMode] = useState('individual');
    const [filters, setFilters] = useState({ roles: [], domains: [] });
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterOptions, setFilterOptions] = useState({
        domains: ["Web Development", "Graphic Designing", "Video Editing", "Content Writing"],
        roles: ["1st Year", "2nd Year", "3rd Year", "4th Year"]
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchFilterOptions();
    }, []);

    useEffect(() => {
        fetchFilteredUsers();
    }, [filters]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredUsers(users);
        } else {
            const lowerCaseSearch = searchTerm.toLowerCase();
            const filtered = users.filter(user =>
                user.name.toLowerCase().includes(lowerCaseSearch) ||
                user.email.toLowerCase().includes(lowerCaseSearch)
            );
            setFilteredUsers(filtered);
        }
    }, [users, searchTerm]);

    const fetchAPI = async (endpoint) => {
        const token = localStorage.getItem('accessToken');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        if (response.ok) return response.json();
        throw new Error(`Failed to fetch from ${endpoint}`);
    };

    const fetchFilterOptions = async () => {
        try {
            const data = await fetchAPI('/api/tasks/users/filter-options');
            if (data.domains?.length > 0 && data.roles?.length > 0) {
                setFilterOptions(data);
            }
        } catch (error) { console.error('Error fetching filter options, using defaults:', error); }
    };

    const fetchFilteredUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.roles.length > 0) params.append('roles', filters.roles.join(','));
            if (filters.domains.length > 0) params.append('domains', filters.domains.join(','));

            const endpoint = `/api/tasks/users/filtered?${params}`;
            const data = await fetchAPI(endpoint);
            setUsers(data.users || []);
        } catch (error) { console.error('Error fetching filtered users:', error); }
        finally { setLoading(false); }
    };

    const toggleFilterOption = (type, value) => {
        setFilters(p => ({
            ...p,
            [type]: p[type].includes(value) ? p[type].filter(v => v !== value) : [...p[type], value]
        }));
    };

    const toggleUser = (userId) => {
        if (filterMode === 'individual') {
            const newSelection = selectedUsers[0] === userId ? [] : [userId];
            onUsersChange(newSelection);
        } else {
            const newSelection = selectedUsers.includes(userId) ? selectedUsers.filter(id => id !== userId) : [...selectedUsers, userId];
            onUsersChange(newSelection);
        }
    };

    const selectAllFiltered = () => onUsersChange([...new Set([...selectedUsers, ...filteredUsers.map(u => u._id || u.id)])]);
    const deselectAllFiltered = () => onUsersChange(selectedUsers.filter(id => !filteredUsers.find(u => (u._id || u.id) === id)));

    return (
        <div className={`space-y-4 p-4 bg-surface border border-border rounded-lg ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center p-1 bg-background rounded-lg border border-border">
                    <button type="button" onClick={() => setFilterMode('individual')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${filterMode === 'individual' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>Individual</button>
                    <button type="button" onClick={() => setFilterMode('group')} className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${filterMode === 'group' ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'}`}>Group</button>
                </div>
                <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
                    <Filter size={16} /><span>Filters</span><ChevronDown className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} size={16} />
                </button>
            </div>

            {showFilters && (
                <div className="bg-background rounded-lg p-4 space-y-4 border border-border">
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Filter by Domain(s)</label>
                        <div className="flex flex-wrap gap-2">{filterOptions.domains.map(d => (<button key={d} type="button" onClick={() => toggleFilterOption('domains', d)} className={`px-3 py-1 rounded-full text-xs font-semibold ${filters.domains.includes(d) ? 'bg-primary text-white' : 'bg-surface hover:bg-border text-text-primary'}`}>{d}</button>))}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-2">Filter by Year(s)</label>
                        <div className="flex flex-wrap gap-2">{filterOptions.roles.map(r => (<button key={r} type="button" onClick={() => toggleFilterOption('roles', r)} className={`px-3 py-1 rounded-full text-xs font-semibold ${filters.roles.includes(r) ? 'bg-primary text-white' : 'bg-surface hover:bg-border text-text-primary'}`}>{r}</button>))}</div>
                    </div>
                </div>
            )}

            <div className="relative">
                <input type="text" placeholder="Search users by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-text-secondary" /></div>
            </div>

            {filterMode === 'group' && filteredUsers.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary">{filteredUsers.length} users found</span>
                    <div className="space-x-2">
                        <button type="button" onClick={selectAllFiltered} className="text-primary hover:text-primary-hover font-semibold">Select Visible</button>
                        <span className="text-border">|</span>
                        <button type="button" onClick={deselectAllFiltered} className="text-text-secondary hover:text-text-primary font-semibold">Deselect Visible</button>
                    </div>
                </div>
            )}

            <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-lg bg-background p-1">
                {loading ? <div className="p-8 text-center text-text-secondary">Loading...</div> :
                    filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <div key={user._id || user.id} onClick={() => toggleUser(user._id || user.id)} className={`flex items-center justify-between p-2 cursor-pointer rounded-md transition-colors ${selectedUsers.includes(user._id || user.id) ? 'bg-primary/10' : 'hover:bg-border'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${selectedUsers.includes(user._id || user.id) ? 'bg-primary border-primary' : 'border-border'}`}>{selectedUsers.includes(user._id || user.id) && <Check size={10} className="text-white" />}</div>
                                <div>
                                    <p className={`font-semibold text-sm ${selectedUsers.includes(user._id || user.id) ? 'text-primary' : 'text-text-primary'}`}>{user.name}</p>
                                    <p className="text-xs text-text-secondary">{user.role} • {user.domains.join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    )) : <div className="p-8 text-center text-text-secondary text-sm">No users found.</div>}
            </div>

            {selectedUsers.length > 0 && (
                <div className="bg-background rounded-lg p-3 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-text-primary text-sm">Selected ({selectedUsers.length})</h4>
                        <button type="button" onClick={() => onUsersChange([])} className="text-red-400 hover:text-red-300 text-xs font-semibold">CLEAR ALL</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedUsers.map(userId => {
                            const user = users.find(u => (u._id || u.id) === userId);
                            return user ? (<span key={userId} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary/20 text-primary">{user.name}<button type="button" onClick={(e) => { e.stopPropagation(); toggleUser(userId); }} className="ml-1.5 text-primary/70 hover:text-primary"><X size={12} /></button></span>) : null;
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DomainSpecificAssignment;