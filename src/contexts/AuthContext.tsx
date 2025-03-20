
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { User } from '@/types';
import { getTeacherData } from '@/services/excel/database';
import { loadTeachersFromStorage } from '@/utils/authHelpers';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    setUser, 
    isLoading, 
    setIsLoading, 
    login, 
    logout 
  } = useAuthOperations();

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Check for stored user in localStorage
      const storedUser = localStorage.getItem('convocation_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          
          // Load teacher data from database when user is present
          await getTeacherData()
            .then(() => console.log('Teacher data loaded on app init'))
            .catch(err => console.error('Failed to load teacher data on init:', err));
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('convocation_user');
        }
      }
      
      setIsLoading(false);
    };
    
    initializeAuth();
  }, [setUser, setIsLoading]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
