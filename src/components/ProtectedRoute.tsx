import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { UserRole } from '../interfaces/User';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show a loading indicator while checking auth status
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Pass the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    // Redirect to an unauthorized page or home page if role is not allowed
    console.warn(`User role '${role}' not allowed for route ${location.pathname}. Allowed: ${allowedRoles.join(', ')}`);
    // Redirect to a generic home or a specific unauthorized page
    return <Navigate to="/" replace />; // Or to="/unauthorized"
  }

  // If authenticated and role is allowed (or role check isn't needed), render the child routes
  return <Outlet />;
};

export default ProtectedRoute;