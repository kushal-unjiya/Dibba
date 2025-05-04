import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext'; // Import useCart
import { UserRole } from '../interfaces/User';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart(); // Get cart items count from context
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
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
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center space-x-2">
            {/* TODO: Replace with actual logo */}
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

          {/* Right Section: Cart (for customers) & Profile */}
          <div className="flex items-center space-x-4">
            {/* Show cart only for customers */}
            {effectiveRole === 'customer' && (
              <Link
                to="/customer/cart"
                className="relative p-2 text-gray-600 hover:text-amber-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Buttons or Profile Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-amber-600 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">{user.name}</span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to={`/${user.role}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Your Profile
                    </Link>
                    {user.role === 'delivery' && (
                      <Link
                        to="/delivery/support"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Support
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              showAuthButtons && (
                <div className="space-x-2">
                  <Link
                    to="/"
                    className="px-4 py-2 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 font-medium"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;