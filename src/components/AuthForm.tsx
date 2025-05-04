import React, { useState } from 'react';
import { UserRole } from '../interfaces/User';

interface AuthFormProps {
  type: 'login' | 'register';
  role: UserRole;
  onSubmit: (data: AuthFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface AuthFormData {
  email: string;
  password: string;
  name?: string;
  phoneNumber?: string;
  address?: string;
  role: UserRole;
}

const AuthForm: React.FC<AuthFormProps> = ({
  type,
  role,
  onSubmit,
  isLoading = false,
  error = null
}) => {
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    address: '',
    role
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getRoleName = (role: UserRole): string => {
    switch (role) {
      case 'customer': return 'Customer';
      case 'homemaker': return 'Homemaker';
      case 'delivery': return 'Delivery Partner';
      default: return 'User';
    }
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {type === 'login' ? 'Sign in to your account' : 'Create your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {type === 'login' ? `Welcome back, ${getRoleName(role)}!` : `Join as a ${getRoleName(role)}`}
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="rounded-md shadow-sm -space-y-px">
          {type === 'register' && (
            <>
              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                />
              </div>

              <div>
                <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number"
                />
              </div>

              {role !== 'delivery' && (
                <div>
                  <label htmlFor="address" className="sr-only">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
                    placeholder="Address"
                    rows={3}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                type === 'login' ? 'rounded-t-md' : ''
              } focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm`}
              placeholder="Email address"
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={type === 'login' ? 'current-password' : 'new-password'}
              required
              value={formData.password}
              onChange={handleChange}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-amber-500 focus:border-amber-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        {type === 'login' && (
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                Forgot your password?
              </a>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            ) : null}
            {type === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthForm;