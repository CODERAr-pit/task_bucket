import React, { useState, useEffect } from 'react';
import { Users, Filter, ChevronDown, Check, X } from 'lucide-react';

const DomainSpecificAssignment = ({ 
  selectedUsers = [], 
  onUsersChange, 
  className = "" 
}) => {
  const [filterMode, setFilterMode] = useState('individual'); // 'individual' or 'group'
  const [filters, setFilters] = useState({
    domain: 'all',
    role: 'all',
    roles: [],
    domains: []
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    domains: [],
    roles: [],
    combinations: []
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions();
    // Also fetch users initially for individual mode
    fetchAllUsers();
  }, []);

  // Fetch users when filters change
  useEffect(() => {
    if (filterMode === 'group') {
      fetchFilteredUsers();
    } else {
      fetchAllUsers();
    }
  }, [filters, filterMode]);

  // Apply search filter
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.domains || []).some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const fetchFilterOptions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/users/filter-options`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      console.log(' Fetching all users from:', `${apiUrl}/api/tasks/users`);
      
      const response = await fetch(`${apiUrl}/api/tasks/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log(' Fetched users successfully:', data.users?.length || 0);
        setUsers(data.users || []);
      } else {
        console.error(' Failed to fetch users:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Response:', errorText);
      }
    } catch (error) {
      console.error(' Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = new URLSearchParams();
      
      if (filters.domain !== 'all') params.append('domain', filters.domain);
      if (filters.role !== 'all') params.append('role', filters.role);
      if (filters.roles.length > 0) params.append('roles', filters.roles.join(','));
      if (filters.domains.length > 0) params.append('domains', filters.domains.join(','));

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/tasks/users/filtered?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching filtered users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleRoleToggle = (role) => {
    setFilters(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleDomainToggle = (domain) => {
    setFilters(prev => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter(d => d !== domain)
        : [...prev.domains, domain]
    }));
  };

  const toggleUser = (userId) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter(id => id !== userId)
      : [...selectedUsers, userId];
    onUsersChange(newSelection);
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredUsers.map(user => user.id);
    const newSelection = [...new Set([...selectedUsers, ...allFilteredIds])];
    onUsersChange(newSelection);
  };

  const deselectAllFiltered = () => {
    const filteredIds = new Set(filteredUsers.map(user => user.id));
    const newSelection = selectedUsers.filter(id => !filteredIds.has(id));
    onUsersChange(newSelection);
  };

  const getFilterSummary = () => {
    if (filterMode === 'individual') return 'Showing all users';
    
    let parts = [];
    if (filters.domain !== 'all') parts.push(`Domain: ${filters.domain}`);
    if (filters.domains.length > 0) parts.push(`Domains: ${filters.domains.join(', ')}`);
    if (filters.role !== 'all') parts.push(`Role: ${filters.role}`);
    if (filters.roles.length > 0) parts.push(`Roles: ${filters.roles.join(', ')}`);
    
    return parts.length > 0 ? parts.join(' | ') : 'No filters applied';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => {
              console.log(' Switching to individual mode');
              setFilterMode('individual');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'individual'
                ? 'bg-status-accepted text-white'
                : 'bg-bg-secondary text-text-body hover:bg-bg-secondary/80'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Individual Selection
          </button>
          <button
            type="button"
            onClick={() => {
              console.log(' Switching to group mode');
              setFilterMode('group');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterMode === 'group'
                ? 'bg-status-accepted text-white'
                : 'bg-bg-secondary text-text-body hover:bg-bg-secondary/80'
            }`}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            Group Selection
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-text-body hover:text-text-heading transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filters</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && filterMode === 'group' && (
        <div className="bg-bg-secondary rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Filter */}
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">Domain</label>
              <select
                value={filters.domain}
                onChange={(e) => handleFilterChange('domain', e.target.value)}
                className="w-full px-3 py-2 border border-border-primary rounded-lg focus:ring-2 text-white bg-[#00043C] focus:ring-status-accepted focus:border-status-accepted"
                disabled={filters.domains.length > 0}
              >
                <option value="all">All Domains</option>
                {filterOptions.domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* Single Role Filter */}
            <div>
              <label className="block text-sm font-medium text-text-body mb-2">Year/Batch</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-border-primary rounded-lg text-white focus:ring-2 bg-[#00043C] focus:ring-status-accepted focus:border-status-accepted"
                disabled={filters.roles.length > 0}
              >
                <option value="all">All Years</option>
                {filterOptions.roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Multiple Domains Filter */}
          <div>
            <label className="block text-sm font-medium text-text-body mb-2">
              Multiple Domains (overrides single domain selection)
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.domains.map(domain => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => handleDomainToggle(domain)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.domains && filters.domains.includes(domain)
                      ? 'bg-status-accepted text-white'
                      : 'bg-bg-primary border border-border-primary text-text-body hover:bg-bg-secondary'
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>

          {/* Multiple Roles Filter */}
          <div>
            <label className="block text-sm font-medium text-text-body mb-2">
              Multiple Years (overrides single year selection)
            </label>
            <div className="flex flex-wrap gap-2">
              {filterOptions.roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleToggle(role)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.roles.includes(role)
                      ? 'bg-status-accepted text-white'
                      : 'bg-bg-primary border border-border-primary text-text-body hover:bg-bg-secondary'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Summary */}
          <div className="text-sm text-text-muted">
            {getFilterSummary()} • Found {filteredUsers.length} users
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users by name, email, domain, or year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border-primary rounded-xl focus:ring-2 focus:ring-status-accepted focus:border-status-accepted bg-bg-primary"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Users className="h-5 w-5 text-text-muted" />
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredUsers.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {filteredUsers.length} users found • {selectedUsers.length} selected
          </span>
          <div className="space-x-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="text-status-accepted hover:text-status-accepted/80 font-medium"
            >
              Select All Visible
            </button>
            <span className="text-text-muted">|</span>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="text-status-declined hover:text-status-declined/80 font-medium"
            >
              Deselect All Visible
            </button>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="space-y-2 max-h-80 overflow-y-auto border border-border-primary rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-text-muted">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-status-accepted"></div>
            <p className="mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => toggleUser(user.id)}
              className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-bg-secondary ${
                selectedUsers.includes(user.id) ? 'bg-status-accepted/10 border-l-4 border-status-accepted' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${selectedUsers.includes(user.id) ? 'bg-status-accepted' : 'bg-bg-secondary border-2 border-border-primary'}`} />
                <div>
                  <p className={`font-medium ${selectedUsers.includes(user.id) ? 'text-text-heading' : 'text-text-body'}`}>
                    {user.name}
                  </p>
                  <p className="text-sm text-text-muted">
                    {user.role} • {(user.domains || [user.domain].filter(Boolean)).join(', ')} • {user.email}
                  </p>
                </div>
              </div>
              {selectedUsers.includes(user.id) && (
                <Check className="w-5 h-5 text-status-accepted" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-text-muted">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No users found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Selected Users Summary */}
      {selectedUsers.length > 0 && (
        <div className="bg-bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-text-heading">
              Selected Users ({selectedUsers.length})
            </h4>
            <button
              type="button"
              onClick={() => onUsersChange([])}
              className="text-status-declined hover:text-status-declined/80 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map(userId => {
              const user = users.find(u => u.id === userId) || filteredUsers.find(u => u.id === userId);
              if (!user) return null;
              
              return (
                <span
                  key={userId}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-status-accepted/20 text-status-accepted border border-status-accepted/30"
                >
                  {user.name} ({user.role})
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleUser(userId);
                    }}
                    className="ml-2 text-status-accepted/70 hover:text-status-accepted"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainSpecificAssignment;
