import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { UserRole } from '../interfaces/User'; // Assuming UserRole is defined here
import { useAuth } from '../contexts/AuthContext'; // Added useAuth

interface SidebarLink {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

interface RoleConfig {
  links: SidebarLink[];
  title: string;
}

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const { logout } = useAuth(); // Get logout function
  const navigate = useNavigate(); // Get navigate function

  const roleConfigs: Record<UserRole, RoleConfig> = {
    customer: {
      title: 'Customer Menu',
      links: [
        { to: '/customer/home', label: 'Home' },
        { to: '/customer/menu', label: 'Menu' },
        { to: '/customer/orders', label: 'My Orders' },
        { to: '/customer/profile', label: 'Profile' }
      ]
    },
    homemaker: {
      title: 'Homemaker Dashboard',
      links: [
        { to: '/homemaker/dashboard', label: 'Dashboard' },
        { to: '/homemaker/meals', label: 'Manage Meals' },
        { to: '/homemaker/orders', label: 'Orders' },
        { to: '/homemaker/earnings', label: 'Earnings' },
        { to: '/homemaker/profile', label: 'Profile' },
        { to: '/homemaker/feedback', label: 'Feedback' }
      ]
    },
    delivery: {
      title: 'Delivery Partner',
      links: [
        { to: '/delivery/dashboard', label: 'Dashboard' },
        { to: '/delivery/orders', label: 'Available Orders' },
        { to: '/delivery/earnings', label: 'Earnings' },
        { to: '/delivery/profile', label: 'Profile' },
        { to: '/delivery/support', label: 'Support' }
      ]
    }
  };

  const config = roleConfigs[role];

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to role selector or login page after logout
  };

  return (
    <div className="fixed left-0 top-16 w-64 bg-white h-[calc(100vh-4rem)] shadow-lg z-40 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">{config.title}</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2 pb-6">
          {config.links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                location.pathname === link.to
                  ? 'bg-amber-100 text-amber-700 font-medium'
                  : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
              }`}
            >
              {link.icon && <span className="mr-3">{link.icon}</span>}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center"
          >
            <span className="mr-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;