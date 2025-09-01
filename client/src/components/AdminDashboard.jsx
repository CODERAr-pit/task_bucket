import { useState, useEffect } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Trash2, Activity, Shield, Clock, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
    const { userId } = useParams(); // Get userId from URL if present
    const [activeTab, setActiveTab] = useState('pending');
    const [pendingUsers, setPendingUsers] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [adminLogs, setAdminLogs] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [highlightedUser, setHighlightedUser] = useState(userId);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is admin
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.isAdmin) {
            setError('Access denied. Admin privileges required.');
            return;
        }

        // If coming from email with userId, start with pending tab
        if (userId) {
            setActiveTab('pending');
            setHighlightedUser(userId);

            // Clear highlight after 5 seconds
            setTimeout(() => {
                setHighlightedUser(null);
            }, 5000);
        }

        if (activeTab === 'pending') {
            fetchPendingUsers();
        } else if (activeTab === 'users') {
            fetchAllUsers();
        } else if (activeTab === 'logs') {
            fetchAdminLogs();
        }

        // Always fetch stats for dashboard summary
        fetchStats();
    }, [activeTab, userId]);

    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || localStorage.getItem('token');
    };

    const fetchStats = async () => {
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchPendingUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/pending`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setPendingUsers(data.users || []);
            } else {
                setError(data.message || 'Failed to fetch pending users');
            }
        } catch (error) {
            console.error('Error fetching pending users:', error);
            setError('Network error fetching pending users');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setAllUsers(data.users || []);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching all users:', error);
            setError('Network error fetching users');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setAdminLogs(data.logs || []);
            } else {
                setError(data.message || 'Failed to fetch admin logs');
            }
        } catch (error) {
            console.error('Error fetching admin logs:', error);
            setError('Network error fetching admin logs');
        } finally {
            setLoading(false);
        }
    };

    const approveUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to approve ${userName}?`)) {
            return;
        }

        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                alert(` ${userName} approved successfully! They will receive a welcome email.`);
                fetchPendingUsers();
                fetchStats();
            } else {
                alert(` Failed to approve user: ${data.message}`);
            }
        } catch (error) {
            console.error('Error approving user:', error);
            alert(' Error approving user. Please try again.');
        }
    };

    const rejectUser = async (userId, userName) => {
        const reason = prompt(`Please provide a reason for rejecting ${userName} (optional):`);
        if (reason === null) return; // User cancelled

        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason }),
            });

            const data = await response.json();

            if (data.success) {
                alert(` ${userName} rejected successfully. They will receive a rejection email.`);
                fetchPendingUsers();
                fetchStats();
            } else {
                alert(` Failed to reject user: ${data.message}`);
            }
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert(' Error rejecting user. Please try again.');
        }
    };

    const deleteUser = async (userId, userName) => {
        if (!confirm(` Are you sure you want to DELETE ${userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (data.success) {
                alert(` ${userName} deleted successfully.`);
                fetchAllUsers();
                fetchStats();
            } else {
                alert(` Failed to delete user: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(' Error deleting user. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-900/50';
            case 'pending': return 'text-yellow-400 bg-yellow-900/50';
            case 'rejected': return 'text-red-400 bg-red-900/50';
            default: return 'text-gray-400 bg-gray-900/50';
        }
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'approve_user': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'reject_user': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'delete_user': return <Trash2 className="w-4 h-4 text-red-400" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    if (error.includes('Access denied')) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="bg-neutral-800 p-10 rounded-2xl shadow-xl text-center border border-neutral-700">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-neutral-400">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-300 font-sans">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Admin Dashboard</h1>
                        <p className="text-neutral-400">Manage users, approvals, and system activity</p>
                    </div>
                    <div className='bg-neutral-800 text-white p-3 rounded-xl transition-all duration-200 hover:bg-neutral-700 shadow-md border border-neutral-700'>
                        <button onClick={() => navigate('/dashboard')} className='flex items-center space-x-2'>
                            <Users className='w-4 h-4' />
                            <span className='font-medium text-sm'>User Dashboard</span>
                        </button>
                    </div>
                </div>

                {/* Email Navigation Banner */}
                {highlightedUser && (
                    <div className="mb-6 bg-yellow-900/20 border-l-4 border-yellow-500 rounded-xl p-4 transition-all duration-300 animate-pulse-once">
                        <div className="flex items-center">
                            <div className="bg-yellow-500 rounded-full p-2 mr-4 flex-shrink-0">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Coming from email notification</h3>
                                <p className="text-sm text-yellow-300">
                                    The user highlighted below needs your review and approval.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {stats.users && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border-l-4 border-emerald-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-400">Total Users</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.users.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-emerald-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-400">Pending</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.users.pending}</p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-yellow-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border-l-4 border-sky-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-400">Active</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.users.active}</p>
                                </div>
                                <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center">
                                    <UserCheck className="w-6 h-6 text-sky-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border-l-4 border-red-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-400">Rejected</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.users.rejected}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <XCircle className="w-6 h-6 text-red-400" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl border-l-4 border-indigo-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-neutral-400">Admins</p>
                                    <p className="text-3xl font-bold text-white mt-1">{stats.users.admins}</p>
                                </div>
                                <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-indigo-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-1 mb-6 bg-neutral-800/50 backdrop-blur-sm p-1 rounded-full border border-neutral-700">
                    {[
                        { id: 'pending', label: 'Pending Approvals', icon: Clock },
                        { id: 'users', label: 'All Users', icon: Users },
                        { id: 'logs', label: 'Activity Logs', icon: Activity }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-neutral-700 text-white shadow-lg'
                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                                }`}
                            >
                                <Icon className="w-4 h-4 mr-2" />
                                {tab.label}
                                {tab.id === 'pending' && stats.users?.pending > 0 && (
                                    <span className="ml-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {stats.users.pending}
                  </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-xl mb-6">
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading Display */}
                {loading && (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                        <p className="mt-2 text-neutral-400">Loading...</p>
                    </div>
                )}

                {/* Content based on active tab */}
                {!loading && !error && (
                    <>
                        {/* Pending Users Tab */}
                        {activeTab === 'pending' && (
                            <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
                                <div className="p-6 border-b border-neutral-700">
                                    <h2 className="text-xl font-semibold text-white">Pending User Approvals</h2>
                                    <p className="text-neutral-400">Review and approve/reject new user registrations</p>
                                </div>
                                {pendingUsers.length === 0 ? (
                                    <div className="p-10 text-center text-neutral-500">
                                        <Clock className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                                        <p className="text-lg">No pending users to review</p>
                                        <p className="text-sm">All registrations have been processed.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-neutral-700">
                                        {pendingUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className={`p-6 flex items-center justify-between transition-colors duration-300 hover:bg-neutral-700/50 ${
                                                    highlightedUser === user._id
                                                        ? 'bg-yellow-900/10 border-l-4 border-yellow-500'
                                                        : ''
                                                }`}
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-neutral-700 rounded-full flex items-center justify-center">
                                                        <Users className="w-6 h-6 text-neutral-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-white">{user.name}</h3>
                                                        <p className="text-sm text-neutral-400">{user.email}</p>
                                                        <div className='flex items-center space-x-2 text-sm mt-1'>
                                                            <p className="text-neutral-500">
                                                                <span className="font-medium text-neutral-400">Role:</span> {user.role}
                                                            </p>
                                                            <p className="text-neutral-500">
                                                                <span className="font-medium text-neutral-400">Domains:</span> {
                                                                user.domains && user.domains.length > 0
                                                                    ? user.domains.join(', ')
                                                                    : user.domain || 'Not specified'
                                                            }
                                                            </p>
                                                        </div>
                                                        <p className="text-xs text-neutral-500 mt-1">
                                                            Registered: {formatDate(user.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 flex-shrink-0">
                                                    <button
                                                        onClick={() => approveUser(user._id, user.name)}
                                                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors duration-200 hover:bg-emerald-700 shadow-md"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectUser(user._id, user.name)}
                                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 hover:bg-red-700 shadow-md"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* All Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
                                <div className="p-6 border-b border-neutral-700">
                                    <h2 className="text-xl font-semibold text-white">All Users</h2>
                                    <p className="text-neutral-400">Manage all registered users ({allUsers.length} total)</p>
                                </div>
                                <div className="divide-y divide-neutral-700 max-h-96 overflow-y-auto">
                                    {allUsers.map((user) => (
                                        <div key={user._id} className="p-6 flex items-center justify-between transition-colors duration-300 hover:bg-neutral-700/50">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    user.status === 'active' ? 'bg-emerald-900/50' :
                                                        user.status === 'pending' ? 'bg-yellow-900/50' : 'bg-red-900/50'
                                                }`}>
                                                    <Users className={`w-6 h-6 ${
                                                        user.status === 'active' ? 'text-emerald-400' :
                                                            user.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-medium text-white">{user.name}</h3>
                                                        {user.isAdmin && (
                                                            <span className="px-2 py-1 bg-indigo-900/50 text-indigo-400 text-xs rounded-full flex items-center">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </span>
                                                        )}
                                                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                                                    </div>
                                                    <p className="text-sm text-neutral-400">{user.email}</p>
                                                    <div className='flex items-center space-x-2 text-sm mt-1'>
                                                        <p className="text-neutral-500">
                                                            <span className="font-medium text-neutral-400">Role:</span> {user.role}
                                                        </p>
                                                        <p className="text-neutral-500">
                                                            <span className="font-medium text-neutral-400">Domains:</span> {
                                                            user.domains && user.domains.length > 0
                                                                ? user.domains.join(', ')
                                                                : user.domain || 'Not specified'
                                                        }
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        Registered: {formatDate(user.createdAt)}
                                                        {user.approvedAt && (
                                                            <span> | Approved: {formatDate(user.approvedAt)}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {!user.isAdmin && (
                                                <button
                                                    onClick={() => deleteUser(user._id, user.name)}
                                                    className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg transition-colors duration-200 hover:bg-red-700 shadow-md"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Activity Logs Tab */}
                        {activeTab === 'logs' && (
                            <div className="bg-neutral-800 rounded-2xl shadow-xl border border-neutral-700">
                                <div className="p-6 border-b border-neutral-700">
                                    <h2 className="text-xl font-semibold text-white">Admin Activity Logs</h2>
                                    <p className="text-neutral-400">Track all admin actions and approvals ({adminLogs.length} entries)</p>
                                </div>
                                <div className="divide-y divide-neutral-700 max-h-96 overflow-y-auto">
                                    {adminLogs.length === 0 ? (
                                        <div className="p-10 text-center text-neutral-500">
                                            <Activity className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
                                            <p className="text-lg">No activity logs yet</p>
                                            <p className="text-sm">Admin actions will appear here.</p>
                                        </div>
                                    ) : (
                                        adminLogs.map((log) => (
                                            <div key={log._id} className="p-6 flex items-center space-x-4 transition-colors duration-300 hover:bg-neutral-700/50">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    log.action === 'approve_user' ? 'bg-emerald-900/50' :
                                                        log.action === 'reject_user' ? 'bg-red-900/50' : 'bg-neutral-700/50'
                                                }`}>
                                                    {getActionIcon(log.action)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-white">
                                                        <strong>{log.admin?.name || 'Unknown Admin'}</strong>{' '}
                                                        <span className='text-neutral-400'>{log.action.replace('_', ' ')} user</span>{' '}
                                                        <strong>{log.targetUser?.name || 'Unknown User'}</strong>
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-1">{log.details}</p>
                                                    <p className="text-xs text-neutral-600 mt-1">
                                                        {formatDate(log.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;