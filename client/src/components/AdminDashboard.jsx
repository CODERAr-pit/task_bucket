import { useState, useEffect } from 'react';
import { Navigate, useParams,useNavigate } from 'react-router-dom';
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
        alert(`✅ ${userName} approved successfully! They will receive a welcome email.`);
        fetchPendingUsers();
        fetchStats();
      } else {
        alert(`❌ Failed to approve user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error approving user:', error);
      alert('❌ Error approving user. Please try again.');
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
        alert(`✅ ${userName} rejected successfully. They will receive a rejection email.`);
        fetchPendingUsers();
        fetchStats();
      } else {
        alert(`❌ Failed to reject user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('❌ Error rejecting user. Please try again.');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!confirm(`⚠️ Are you sure you want to DELETE ${userName}? This action cannot be undone.`)) {
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
        alert(`✅ ${userName} deleted successfully.`);
        fetchAllUsers();
        fetchStats();
      } else {
        alert(`❌ Failed to delete user: ${data.message}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Error deleting user. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'approve_user': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'reject_user': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'delete_user': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  if (error.includes('Access denied')) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="bg-bg-card p-8 rounded-2xl shadow-card text-center border border-border-primary">
          <Shield className="w-16 h-16 text-status-declined mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-heading mb-2">Access Denied</h1>
          <p className="text-text-body">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-heading mb-2">Admin Dashboard</h1>
          <p className="text-text-body">Manage users, approvals, and system activity</p>
        </div>
        <div className='bg-bg-card-hover text-text-heading p-2 mb-4 rounded-2xl w-auto inline-block border border-border-primary shadow-card'><button onClick={() => navigate('/dashboard')}>
  Switch to User Dashboard
</button></div>

        {/* Email Navigation Banner */}
        {highlightedUser && (
          <div className="mb-6 bg-bg-card-hover border border-border-primary rounded-2xl p-4">
            <div className="flex items-center">
              <div className="bg-badge-academic rounded-full p-1 mr-3">
                <Users className="w-4 h-4 text-text-heading" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-heading">Coming from email notification</h3>
                <p className="text-sm text-text-body">
                  The highlighted user below needs your review and approval.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {stats.users && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-bg-card p-6 rounded-2xl shadow-card border-l-4 border-badge-academic">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-badge-academic" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-body">Total Users</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.users.total}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card p-6 rounded-2xl shadow-card border-l-4 border-badge-service">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-badge-service" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-body">Pending</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.users.pending}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card p-6 rounded-2xl shadow-card border-l-4 border-badge-corporate">
              <div className="flex items-center">
                <UserCheck className="w-8 h-8 text-badge-corporate" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-body">Active</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.users.active}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card p-6 rounded-2xl shadow-card border-l-4 border-status-declined">
              <div className="flex items-center">
                <XCircle className="w-8 h-8 text-status-declined" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-body">Rejected</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.users.rejected}</p>
                </div>
              </div>
            </div>
            <div className="bg-bg-card p-6 rounded-2xl shadow-card border-l-4 border-badge-public">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-badge-public" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-text-body">Admins</p>
                  <p className="text-2xl font-bold text-text-heading">{stats.users.admins}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-bg-card-hover p-1 rounded-2xl border border-border-primary">
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
                className={`flex items-center px-4 py-2 rounded-2xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-bg-card text-badge-academic shadow-card'
                    : 'text-text-body hover:text-text-heading hover:bg-bg-card-hover'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.id === 'pending' && stats.users?.pending > 0 && (
                  <span className="ml-2 bg-status-declined text-text-heading text-xs px-2 py-1 rounded-full">
                    {stats.users.pending}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-status-declined/10 border border-status-declined text-status-declined px-4 py-3 rounded-2xl mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-badge-academic"></div>
            <p className="mt-2 text-text-body">Loading...</p>
          </div>
        )}

        {/* Content based on active tab */}
        {!loading && !error && (
          <>
            {/* Pending Users Tab */}
            {activeTab === 'pending' && (
              <div className="bg-bg-card rounded-2xl shadow-card border border-border-primary">
                <div className="p-6 border-b border-border-primary">
                  <h2 className="text-xl font-semibold text-text-heading">Pending User Approvals</h2>
                  <p className="text-text-body">Review and approve/reject new user registrations</p>
                </div>
                {pendingUsers.length === 0 ? (
                  <div className="p-6 text-center text-text-muted">
                    <Clock className="w-16 h-16 text-text-muted mx-auto mb-4" />
                    <p className="text-lg">No pending users to review</p>
                    <p className="text-sm">All registrations have been processed.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-primary">
                    {pendingUsers.map((user) => (
                      <div 
                        key={user._id} 
                        className={`p-6 flex items-center justify-between hover:bg-bg-card-hover transition-colors rounded-2xl ${
                          highlightedUser === user._id 
                            ? 'bg-badge-academic/10 border-l-4 border-badge-academic shadow-card' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-badge-service/20 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-badge-service" />
                          </div>
                          <div>
                            <h3 className="font-medium text-text-heading">{user.name}</h3>
                            <p className="text-sm text-text-body">{user.email}</p>
                            <p className="text-sm text-text-muted">
                              <span className="font-medium">Role:</span> {user.role} | 
                              <span className="font-medium ml-1">Domain:</span> {user.domain}
                            </p>
                            <p className="text-xs text-text-muted">
                              Registered: {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => approveUser(user._id, user.name)}
                            className="flex items-center px-4 py-2 bg-status-accepted text-text-heading rounded-2xl hover:bg-status-accepted/80 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectUser(user._id, user.name)}
                            className="flex items-center px-4 py-2 bg-status-declined text-text-heading rounded-2xl hover:bg-status-declined/80 transition-colors"
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
              <div className="bg-bg-card rounded-2xl shadow-card border border-border-primary">
                <div className="p-6 border-b border-border-primary">
                  <h2 className="text-xl font-semibold text-text-heading">All Users</h2>
                  <p className="text-text-body">Manage all registered users ({allUsers.length} total)</p>
                </div>
                <div className="divide-y divide-border-primary max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <div key={user._id} className="p-6 flex items-center justify-between hover:bg-bg-card-hover rounded-2xl transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          user.status === 'active' ? 'bg-status-accepted/20' :
                          user.status === 'pending' ? 'bg-status-pending/20' : 'bg-status-declined/20'
                        }`}>
                          <Users className={`w-6 h-6 ${
                            user.status === 'active' ? 'text-status-accepted' :
                            user.status === 'pending' ? 'text-status-pending' : 'text-status-declined'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-text-heading">{user.name}</h3>
                            {user.isAdmin && (
                              <span className="px-2 py-1 bg-badge-public/20 text-badge-public text-xs rounded-full flex items-center">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </span>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(user.status)}`}> 
                              {user.status}
                            </span>
                          </div>
                          <p className="text-sm text-text-body">{user.email}</p>
                          <p className="text-sm text-text-muted">
                            <span className="font-medium">Role:</span> {user.role} | 
                            <span className="font-medium ml-1">Domain:</span> {user.domain}
                          </p>
                          <p className="text-xs text-text-muted">
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
                          className="flex items-center px-3 py-2 bg-status-declined text-text-heading rounded-2xl hover:bg-status-declined/80 transition-colors"
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
              <div className="bg-bg-card rounded-2xl shadow-card border border-border-primary">
                <div className="p-6 border-b border-border-primary">
                  <h2 className="text-xl font-semibold text-text-heading">Admin Activity Logs</h2>
                  <p className="text-text-body">Track all admin actions and approvals ({adminLogs.length} entries)</p>
                </div>
                <div className="divide-y divide-border-primary max-h-96 overflow-y-auto">
                  {adminLogs.length === 0 ? (
                    <div className="p-6 text-center text-text-muted">
                      <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      <p className="text-lg">No activity logs yet</p>
                      <p className="text-sm">Admin actions will appear here.</p>
                    </div>
                  ) : (
                    adminLogs.map((log) => (
                      <div key={log._id} className="p-6 flex items-center space-x-4 hover:bg-bg-card-hover rounded-2xl transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          log.action === 'approve_user' ? 'bg-status-accepted/20' :
                          log.action === 'reject_user' ? 'bg-status-declined/20' : 'bg-bg-card-hover'
                        }`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-text-heading">
                            <strong>{log.admin?.name || 'Unknown Admin'}</strong>{' '}
                            {log.action.replace('_', ' ')} user{' '}
                            <strong>{log.targetUser?.name || 'Unknown User'}</strong>
                          </p>
                          <p className="text-xs text-text-body mt-1">{log.details}</p>
                          <p className="text-xs text-text-muted mt-1">
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
