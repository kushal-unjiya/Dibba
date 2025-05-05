import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../interfaces/User';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/'
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!user) {
    // Determine the appropriate auth route based on the current path
    let authRoute = redirectTo;
    if (location.pathname.startsWith('/customer')) {
      authRoute = '/customer-auth';
    } else if (location.pathname.startsWith('/homemaker')) {
      authRoute = '/homemaker-auth';
    } else if (location.pathname.startsWith('/delivery')) {
      authRoute = '/delivery-auth';
    }

    // Save the attempted url for redirecting after login
    const loginRedirect = `${location.pathname}${location.search}`;
    return <Navigate to={authRoute} state={{ from: loginRedirect }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // User is logged in but doesn't have the required role
    // Redirect to their appropriate home page
    const roleHomePage = {
      customer: '/customer/home',
      homemaker: '/homemaker/dashboard',
      delivery: '/delivery/dashboard'
    }[user.role];

    return <Navigate to={roleHomePage || '/'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;