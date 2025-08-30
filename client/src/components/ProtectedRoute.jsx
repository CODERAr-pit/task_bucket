import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');
  
  // If no token or user data, redirect to login
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }
  
  // If admin is required, check if user is admin
  if (requireAdmin) {
    try {
      const user = JSON.parse(userData);
      if (!user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      return <Navigate to="/" replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;
