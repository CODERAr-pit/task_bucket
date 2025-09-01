// Frontend utility for handling task permissions

export const fetchTaskPermissions = async (taskId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No authentication token found');
            }
        }

        const authToken = localStorage.getItem('token') || localStorage.getItem('accessToken');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/tasks/${taskId}/permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.permissions;
    } catch (error) {
        console.error('Error fetching task permissions:', error);
        return {
            canEdit: false,
            canUpdateStatus: true, // Default: everyone can update status
            userRole: null,
            userRoleLevel: 0
        };
    }
};

// Helper function to check if user can perform specific actions
export const canUserEditTask = (permissions) => {
    return permissions?.canEdit || false;
};

export const canUserUpdateStatus = (permissions) => {
    return permissions?.canUpdateStatus !== false; // Default true if not specified
};

// Helper to get user role information
export const getUserRoleInfo = (permissions) => {
    return {
        role: permissions?.userRole || 'unknown',
        roleLevel: permissions?.userRoleLevel || 0
    };
};
