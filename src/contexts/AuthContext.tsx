import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../interfaces/User';
import { authAPI, usersAPI } from '../services/api'; // Import API services

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem('authToken');
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // Get current user from API
      const userData = await usersAPI.getCurrentUser(storedToken);
      setUser(userData);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication status when the provider mounts
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const { user, token } = await authAPI.login(email, password, role);
      setUser(user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    setIsLoading(true);
    try {
      // Call the appropriate registration API based on the role
      let response;
      switch (userData.role) {
        case 'customer':
          response = await authAPI.registerCustomer({ ...userData, password });
          break;
        case 'homemaker':
          response = await authAPI.registerHomemaker({ ...userData, password });
          break;
        case 'delivery':
          response = await authAPI.registerDelivery({ ...userData, password });
          break;
        default:
          throw new Error('Invalid role specified for registration');
      }

      const { user, token } = response;
      setUser(user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(user));
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const isAuthenticated = !!user;
  const role = user?.role || null;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        role, 
        isLoading, 
        login, 
        logout, 
        checkAuth,
        register 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};