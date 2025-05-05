import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../interfaces/User'; // Import UserRole

const CustomerAuth: React.FC = () => {
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
        await login(formData.email, formData.password, 'customer');
        navigate('/customer/home');
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          role: 'customer' as UserRole, // Cast to UserRole
          address: formData.address,
          createdAt: new Date(),
        };
        
        await register(userData, formData.password);
        navigate('/customer/home');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center text-amber-800">
        Customer Portal - {isLogin ? 'Login' : 'Sign Up'}
      </h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <AuthForm
        type={isLogin ? 'login' : 'register'}
        role="customer"
        onSubmit={handleAuthSubmit}
        isLoading={isLoading}
      />
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-amber-600 hover:underline"
          disabled={isLoading}
        >
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
};

export default CustomerAuth;