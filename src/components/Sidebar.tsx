import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { UserRole } from '../interfaces/User'; // Assuming UserRole is defined here
import { useAuth } from '../contexts/AuthContext'; // Added useAuth

interface SidebarProps {
  role: UserRole; // Determine which links to show
}

interface NavItem {
  label: string;
  path: string;
  icon?: JSX.Element; // Optional icon element
}

// Define navigation items based on role
const getNavItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case 'homemaker':
      return [
        { label: 'Dashboard', path: '/homemaker/dashboard' },
        { label: 'Meal Manager', path: '/homemaker/meals' },
        { label: 'Order Manager', path: '/homemaker/orders' },
        { label: 'Earnings', path: '/homemaker/earnings' },
        { label: 'Feedback', path: '/homemaker/feedback' },
        { label: 'Profile', path: '/homemaker/profile' },
      ];
    case 'delivery':
      return [
        { label: 'Dashboard', path: '/delivery/dashboard' },
        { label: 'Available Orders', path: '/delivery/orders' },
        { label: 'Earnings', path: '/delivery/earnings' }, // Ensure file is Earnings.tsx
        { label: 'Profile', path: '/delivery/profile' },
        { label: 'Support', path: '/delivery/support' }, // Corrected path assuming file is DeliverySupport.tsx
      ];
    // Add cases for other roles if needed (customer might not need a sidebar)
    default:
      return [];
  }
};

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const location = useLocation();
  const navItems = getNavItems(role);
  const { logout } = useAuth(); // Get logout function
  const navigate = useNavigate(); // Get navigate function

  // Basic styling - enhance as needed
  const baseClasses = "block px-4 py-2 rounded hover:bg-gray-200 transition-colors duration-150";
  const activeClasses = "bg-blue-100 text-blue-700 font-semibold";

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to role selector or login page after logout
  };

  return (
    <aside className="w-64 bg-blue-50 p-4 h-full shadow-md flex flex-col"> {/* Adjust styling as needed */}
      <h2 className="text-xl font-semibold mb-6 text-gray-800 capitalize">{role} Menu</h2>
      <nav className="flex-grow">
        <ul>
          {navItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`${baseClasses} ${location.pathname === item.path ? activeClasses : 'text-gray-700'}`}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
       {/* Optional: Add logout button or user info at the bottom */}
       <div className="mt-auto">
            <button
                onClick={handleLogout} // Added onClick handler
                className="w-full text-left px-4 py-2 rounded text-red-600 hover:bg-red-100 transition-colors duration-150"
            >
                Logout
            </button>
       </div>
    </aside>
  );
};

export default Sidebar;