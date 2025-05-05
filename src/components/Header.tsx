import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; // Import useCart
import { UserRole } from '../interfaces/User';

interface HeaderProps {
  hideCart?: boolean;
  hideAuth?: boolean;
  transparentBg?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  hideCart = false,
  hideAuth = false,
  transparentBg = false
}) => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart(); // Get cart items count from context
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Helper to get role-specific navigation links
  const getRoleSpecificLinks = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return [
          { to: '/customer/home', label: 'Home' },
          { to: '/customer/menu', label: 'Menu' },
          { to: '/customer/profile', label: 'Profile' },
        ];
      case 'homemaker':
        return [
          { to: '/homemaker/dashboard', label: 'Dashboard' },
          { to: '/homemaker/meals', label: 'Meals' },
          { to: '/homemaker/orders', label: 'Orders' },
          { to: '/homemaker/earnings', label: 'Earnings' },
        ];
      case 'delivery':
        return [
          { to: '/delivery/dashboard', label: 'Dashboard' },
          { to: '/delivery/orders', label: 'Available Orders' },
          { to: '/delivery/earnings', label: 'Earnings' },
        ];
      default:
        return [];
    }
  };

  // Check if current path matches a role
  const getCurrentUserRole = (): UserRole | null => {
    const path = location.pathname;
    if (path.startsWith('/customer/')) return 'customer';
    if (path.startsWith('/homemaker/')) return 'homemaker';
    if (path.startsWith('/delivery/')) return 'delivery';
    return null;
  };

  // Determine if we should show role-based UI based on current path
  const currentPathRole = getCurrentUserRole();

  // If user is not authenticated but on a role-specific path, show UI for that role
  const effectiveRole = user?.role || currentPathRole;
  
  // Show auth buttons only if not in a role-specific section
  const showAuthButtons = !user && !currentPathRole;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 ${
        transparentBg ? 'bg-transparent' : 'bg-white shadow-sm'
      }`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-amber-600">Dibba</span>
              <span className="text-sm text-gray-600">Swad Ghar Ka</span>
            </Link>

            {/* Navigation Links */}
            {effectiveRole && (
              <nav className="hidden md:flex items-center space-x-6">
                {getRoleSpecificLinks(effectiveRole).map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`text-gray-600 hover:text-amber-600 ${
                      location.pathname === link.to ? 'font-semibold text-amber-600' : ''
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
            
            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Show cart only for customers */}
              {effectiveRole === 'customer' && !hideCart && (
                <Link to="/customer/cart" className="text-gray-600 hover:text-amber-600">
                  <div className="relative">
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {totalItems > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                </Link>
              )}
              
              {/* User menu/auth buttons */}
              {showAuthButtons ? (
                <div className="flex items-center space-x-2">
                  <Link to="/homemaker-auth" className="text-amber-600 hover:text-amber-700">Login</Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/homemaker-auth?signup=true" className="text-amber-600 hover:text-amber-700">Sign Up</Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      {/* Add a spacer div to prevent content from going under the header */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;