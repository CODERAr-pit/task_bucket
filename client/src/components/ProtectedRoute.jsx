import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const userData = localStorage.getItem('userData');
  
  // If no token or user data, redirect to login
  if (!token || !userData) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
