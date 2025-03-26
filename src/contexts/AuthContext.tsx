
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { Role, User } from '@/types';

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  login: (email: string, password: string, deviceType: 'mobile' | 'desktop', loginMode?: 'teacher' | 'admin') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  isLoading: false,
  setIsLoading: () => {},
  login: async () => false,
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login: baseLogin, logout: baseLogout } = useAuthOperations();

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('convocation_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setUser(parsedUser);
        console.log("Restored user from localStorage:", parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('convocation_user');
      }
    }
  }, []);

  const login = async (
    email: string, 
    password: string, 
    deviceType: 'mobile' | 'desktop', 
    loginMode?: 'teacher' | 'admin'
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Starting login with mode: ${loginMode}, email: ${email}`);
      const success = await baseLogin(email, password);
      
      if (success) {
        // Retrieve user from localStorage
        const storedUser = localStorage.getItem('convocation_user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          console.log('Loaded user from storage:', parsedUser);
          setUser(parsedUser);
          
          // Log device usage
          try {
            await logDeviceUsage(parsedUser, deviceType);
          } catch (error) {
            console.error('Failed to log device usage, but login still successful:', error);
          }
        }
        return true;
      } else {
        console.error('Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
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
