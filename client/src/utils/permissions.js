// Frontend utility for handling task permissions

export const fetchTaskPermissions = async (taskId) => {
    try {
        console.log('Fetching permissions for task:', taskId);
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found, trying accessToken');
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                throw new Error('No authentication token found');
            }
        }

        const authToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
        console.log('Using token for permissions:', authToken ? 'Token found' : 'No token');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/tasks/${taskId}/permissions`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Permissions response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Permissions data received:', data);
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
