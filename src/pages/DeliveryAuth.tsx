import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm'; // Adjust path as needed
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { DeliveryPartner } from '../interfaces/DeliveryPartner'; // Adjust path as needed

const DeliveryAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleAuthSubmit = async (formData: any) => {
    setError(null);
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        await login(formData.email, formData.password, 'delivery');
        navigate('/delivery/dashboard');
      } else {
        // Handle registration
        const userData: Partial<DeliveryPartner> = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: 'delivery',
          isAvailable: true,
          createdAt: new Date(),
          // Vehicle details will be collected during profile setup
        };
        
        await register(userData, formData.password);
        navigate('/delivery/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Delivery Partner Portal - {isLogin ? 'Login' : 'Sign Up'}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <AuthForm
        formType={isLogin ? 'login' : 'signup'}
        onSubmit={handleAuthSubmit}
        isLoading={isLoading}
        role="delivery"
      />
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-600 hover:underline"
          disabled={isLoading}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
      
       {/* Add fields specific to Delivery signup if needed */}
       {!isLogin && (
         <div className="mt-4 p-4 border rounded bg-gray-50 text-sm">
            <p className="font-semibold mb-2">Additional Signup Details:</p>
            <p className="text-gray-600">You'll need to provide vehicle and identity details after signup.</p>
         </div>
       )}
    </div>
  );
};

export default DeliveryAuth;