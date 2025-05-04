import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../interfaces/User'; // Adjust path as needed
// Import useAuth if needed for redirection based on existing auth state
// import { useAuth } from '../contexts/AuthContext';

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();
  // const { user, isLoading } = useAuth(); // Optional: Check if already logged in

  // Optional: Redirect if already logged in and role is known
  // useEffect(() => {
  //   if (!isLoading && user?.role) {
  //      navigate(`/${user.role}/dashboard`); // Or appropriate landing page
  //   }
  // }, [user, isLoading, navigate]);

  const handleRoleSelection = (role: UserRole) => {
    switch (role) {
      case 'customer':
        navigate('/customer/home');
        break;
      case 'homemaker':
        navigate('/homemaker-auth'); // Changed from '/homemaker-auth'
        break;
      case 'delivery':
        navigate('/delivery-auth'); // Changed from '/delivery-auth'
        break;
      default:
        console.error('Invalid role selected');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8"> {/* Adjust height based on header/footer */}
      <h1 className="text-4xl font-bold text-amber-800 mb-4">Welcome to Dibba!</h1>
      <p className="text-lg text-gray-600 mb-8">Swad Ghar Ka - Homemade Happiness Delivered.</p>
      <h2 className="text-2xl font-semibold mb-6">Choose Your Role:</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {/* Customer Card */}
        <div
          onClick={() => handleRoleSelection('customer')}
          className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900"
        >
          <h3 className="text-2xl font-semibold mb-2">I'm a Customer</h3>
          <p>Browse and order delicious homemade meals.</p>
        </div>

        {/* Homemaker Card */}
        <div
          onClick={() => handleRoleSelection('homemaker')}
          className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-900"
        >
          <h3 className="text-2xl font-semibold mb-2">I'm a Homemaker</h3>
          <p>Share your culinary skills and manage your orders.</p>
        </div>

        {/* Delivery Partner Card */}
        <div
          onClick={() => handleRoleSelection('delivery')}
          className="border rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-gradient-to-br from-gray-100 to-slate-100 text-gray-900"
        >
          <h3 className="text-2xl font-semibold mb-2">I'm a Delivery Partner</h3>
          <p>Deliver happiness and manage your earnings.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;