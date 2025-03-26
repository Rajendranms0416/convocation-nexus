
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { Role } from '@/types';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  assignedClasses?: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, password: string, deviceType: 'mobile' | 'desktop', loginMode?: 'teacher' | 'admin') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isLoading: false,
  setIsLoading: () => {},
  login: async () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: baseLogin, logout: baseLogout } = useAuthOperations();

  const login = async (
    email: string, 
    password: string, 
    deviceType: 'mobile' | 'desktop', 
    loginMode?: 'teacher' | 'admin'
  ) => {
    setIsLoading(true);
    try {
      const success = await baseLogin(email, password);
      if (success) {
        // Retrieve user from localStorage
        const storedUser = localStorage.getItem('convocation_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          
          // Log device usage
          await logDeviceUsage(parsedUser, deviceType);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    baseLogout();
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isAuthenticated,
      isLoading,
      setIsLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
