
import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { handleSession } from '@/utils/authHelpers';
import { useAuthOperations } from '@/hooks/useAuthOperations';

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          const userWithRole = await handleSession(session);
          setUser(userWithRole);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session) {
        const userWithRole = await handleSession(session);
        setUser(userWithRole);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
