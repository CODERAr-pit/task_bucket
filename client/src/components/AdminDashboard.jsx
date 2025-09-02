import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Trash2, Activity, Shield, Clock, UserCheck } from 'lucide-react';
import Footer from './Footer';

const AdminDashboard = () => {
    const { userId } = useParams();
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
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (!userData.isAdmin) {
            setError('Access denied. Admin privileges required.');
            return;
        }

        if (userId) {
            setActiveTab('pending');
            setHighlightedUser(userId);
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

        fetchStats();
    }, [activeTab, userId]);

    // --- API Fetch and Action Functions ---
    const getAuthToken = () => localStorage.getItem('accessToken');

    const fetchStats = async () => {
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setStats(data.stats || {});
        } catch (error) { console.error('Error fetching stats:', error); }
    };

    const fetchPendingUsers = async () => {
        setLoading(true); setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setPendingUsers(data.users || []);
            else setError(data.message || 'Failed to fetch pending users');
        } catch (error) { setError('Network error fetching pending users'); }
        finally { setLoading(false); }
    };

    const fetchAllUsers = async () => {
        setLoading(true); setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setAllUsers(data.users || []);
            else setError(data.message || 'Failed to fetch users');
        } catch (error) { setError('Network error fetching users'); }
        finally { setLoading(false); }
    };

    const fetchAdminLogs = async () => {
        setLoading(true); setError('');
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/logs`, { headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) setAdminLogs(data.logs || []);
            else setError(data.message || 'Failed to fetch admin logs');
        } catch (error) { setError('Network error fetching admin logs'); }
        finally { setLoading(false); }
    };

    const approveUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to approve ${userName}?`)) return;
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}/approve`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                alert(`${userName} approved successfully!`);
                fetchPendingUsers();
                fetchStats();
            } else { alert(`Failed to approve user: ${data.message}`); }
        } catch (error) { alert('Error approving user.'); }
    };

    const rejectUser = async (userId, userName) => {
        const reason = prompt(`Please provide a reason for rejecting ${userName} (optional):`);
        if (reason === null) return;
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}/reject`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
            const data = await response.json();
            if (data.success) {
                alert(`${userName} rejected successfully.`);
                fetchPendingUsers();
                fetchStats();
            } else { alert(`Failed to reject user: ${data.message}`); }
        } catch (error) { alert('Error rejecting user.'); }
    };

    const deleteUser = async (userId, userName) => {
        if (!confirm(`Are you sure you want to DELETE ${userName}? This action is permanent.`)) return;
        try {
            const token = getAuthToken();
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiUrl}/api/admin/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            const data = await response.json();
            if (data.success) {
                alert(`${userName} deleted successfully.`);
                fetchAllUsers();
                fetchStats();
            } else { alert(`Failed to delete user: ${data.message}`); }
        } catch (error) { alert('Error deleting user.'); }
    };

    // --- Helper functions for styling ---
    const formatDate = (dateString) => new Date(dateString).toLocaleString();
    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-900/40 text-emerald-300';
            case 'pending': return 'bg-amber-900/40 text-amber-300';
            case 'rejected': return 'bg-red-900/40 text-red-300';
            default: return 'bg-border text-text-secondary';
        }
    };
    const getActionIcon = (action) => {
        switch (action) {
            case 'approve_user': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'reject_user': return <XCircle className="w-5 h-5 text-red-400" />;
            case 'delete_user': return <Trash2 className="w-5 h-5 text-red-400" />;
            default: return <Activity className="w-5 h-5 text-text-secondary" />;
        }
    };

    if (error.includes('Access denied')) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="bg-surface p-10 rounded-2xl shadow-soft-xl text-center border border-border">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-text-primary mb-2">Access Denied</h1>
                    <p className="text-text-secondary">You need admin privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-text-primary font-sans flex flex-col">
            <main className="w-full max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 flex-grow">
                <header className="mb-10 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">Admin Dashboard</h1>
                        <p className="text-text-secondary mt-1">Manage users, approvals, and system activity.</p>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center bg-surface hover:bg-border text-text-primary font-semibold py-2.5 px-5 rounded-lg transition-colors border border-border">
                        <Users size={16} className="mr-2" />
                        User Dashboard
                    </button>
                </header>

                {stats.users && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <div className="bg-surface p-6 rounded-xl border border-border"><div className="flex items-center justify-between"><p className="text-sm font-medium text-text-secondary">Total Users</p><Users className="w-5 h-5 text-text-secondary" /></div><p className="text-3xl font-bold text-text-primary mt-2">{stats.users.total}</p></div>
                        <div className="bg-surface p-6 rounded-xl border border-border"><div className="flex items-center justify-between"><p className="text-sm font-medium text-text-secondary">Pending</p><Clock className="w-5 h-5 text-amber-400" /></div><p className="text-3xl font-bold text-amber-400 mt-2">{stats.users.pending}</p></div>
                        <div className="bg-surface p-6 rounded-xl border border-border"><div className="flex items-center justify-between"><p className="text-sm font-medium text-text-secondary">Active</p><UserCheck className="w-5 h-5 text-emerald-400" /></div><p className="text-3xl font-bold text-emerald-400 mt-2">{stats.users.active}</p></div>
                        <div className="bg-surface p-6 rounded-xl border border-border"><div className="flex items-center justify-between"><p className="text-sm font-medium text-text-secondary">Rejected</p><XCircle className="w-5 h-5 text-red-400" /></div><p className="text-3xl font-bold text-red-400 mt-2">{stats.users.rejected}</p></div>
                        <div className="bg-surface p-6 rounded-xl border border-border"><div className="flex items-center justify-between"><p className="text-sm font-medium text-text-secondary">Admins</p><Shield className="w-5 h-5 text-indigo-400" /></div><p className="text-3xl font-bold text-indigo-400 mt-2">{stats.users.admins}</p></div>
                    </div>
                )}

                <div className="flex items-center p-1 bg-surface rounded-lg border border-border mb-8">
                    {['pending', 'users', 'logs'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-white font-semibold' : 'text-text-secondary hover:text-text-primary'}`}>
                            {tab === 'pending' && <Clock size={16}/>}{tab === 'users' && <Users size={16}/>}{tab === 'logs' && <Activity size={16}/>}
                            <span className="capitalize">{tab}</span>
                            {tab === 'pending' && stats.users?.pending > 0 && <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{stats.users.pending}</span>}
                        </button>
                    ))}
                </div>

                {loading && <div className="text-center py-12"><div className="w-8 h-8 mx-auto border-4 border-border border-t-primary rounded-full animate-spin"></div></div>}

                {error && <div className="bg-red-800/40 border border-red-700/50 text-red-300 rounded-lg p-3 text-center"><p className="font-medium text-sm">{error}</p></div>}

                {!loading && !error && (
                    <div className="bg-surface border border-border rounded-xl">
                        {/* Pending Users Tab */}
                        {activeTab === 'pending' && (
                            <div>
                                <div className="p-6 border-b border-border"><h2 className="text-lg font-semibold text-text-primary">Pending User Approvals</h2></div>
                                {pendingUsers.length > 0 ? pendingUsers.map(user => (
                                    <div key={user._id} className={`p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border last:border-b-0 hover:bg-border transition-colors ${highlightedUser === user._id ? 'bg-primary/10' : ''}`}>
                                        <div>
                                            <p className="font-semibold text-text-primary">{user.name}</p>
                                            <p className="text-sm text-text-secondary">{user.email} • {user.role}</p>
                                            <p className="text-xs text-text-secondary mt-1">Domains: {user.domains?.join(', ') || 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button onClick={() => approveUser(user._id, user.name)} className="px-3 py-1.5 text-sm font-semibold bg-emerald-600 text-white rounded-md hover:bg-emerald-700">Approve</button>
                                            <button onClick={() => rejectUser(user._id, user.name)} className="px-3 py-1.5 text-sm font-semibold bg-red-600 text-white rounded-md hover:bg-red-700">Reject</button>
                                        </div>
                                    </div>
                                )) : <div className="p-10 text-center text-text-secondary">No pending users to review.</div>}
                            </div>
                        )}

                        {/* All Users Tab */}
                        {activeTab === 'users' && (
                            <div>
                                <div className="p-6 border-b border-border"><h2 className="text-lg font-semibold text-text-primary">All Users ({allUsers.length})</h2></div>
                                {allUsers.length > 0 ? allUsers.map(user => (
                                    <div key={user._id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border last:border-b-0 hover:bg-border transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-text-primary">{user.name}</p>
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${getStatusColor(user.status)}`}>{user.status}</span>
                                                {user.isAdmin && <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-900/50 text-indigo-300">Admin</span>}
                                            </div>
                                            <p className="text-sm text-text-secondary">{user.email} • {user.role}</p>
                                            <p className="text-xs text-text-secondary mt-1">Domains: {user.domains?.join(', ') || 'N/A'}</p>
                                        </div>
                                        {!user.isAdmin && <button onClick={() => deleteUser(user._id, user.name)} className="p-2 text-red-400 bg-surface border border-border rounded-lg hover:bg-red-900/40 hover:border-red-700/50 transition-colors"><Trash2 size={16} /></button>}
                                    </div>
                                )) : <div className="p-10 text-center text-text-secondary">No users found.</div>}
                            </div>
                        )}

                        {/* Activity Logs Tab */}
                        {activeTab === 'logs' && (
                            <div>
                                <div className="p-6 border-b border-border"><h2 className="text-lg font-semibold text-text-primary">Activity Logs ({adminLogs.length})</h2></div>
                                {adminLogs.length > 0 ? adminLogs.map(log => (
                                    <div key={log._id} className="p-6 flex items-center gap-4 border-b border-border last:border-b-0 hover:bg-border transition-colors">
                                        <div className="flex-shrink-0">{getActionIcon(log.action)}</div>
                                        <div>
                                            <p className="text-sm text-text-primary">
                                                <span className="font-semibold">{log.admin?.name || 'Admin'}</span>
                                                <span className="text-text-secondary"> {log.action.replace('_', ' ')}: </span>
                                                <span className="font-semibold">{log.targetUser?.name || 'a user'}</span>
                                            </p>
                                            <p className="text-xs text-text-secondary">{formatDate(log.createdAt)}</p>
                                        </div>
                                    </div>
                                )) : <div className="p-10 text-center text-text-secondary">No activity logs found.</div>}
                            </div>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;