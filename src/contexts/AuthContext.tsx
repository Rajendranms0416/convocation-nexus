
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, deviceType: 'mobile' | 'desktop') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Handle session changes (login, logout, token refresh)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          await handleSession(session);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await handleSession(session);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to handle session and get user data
  const handleSession = async (session: Session) => {
    try {
      // Get user metadata
      const { 
        user: authUser, 
      } = session;
      
      if (!authUser) return;
      
      // Create user object from auth data
      const userWithRole: User = {
        id: authUser.id,
        name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (authUser.user_metadata.role || 'presenter') as Role,
        avatar: authUser.user_metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User')}&background=random&color=fff`,
      };
      
      setUser(userWithRole);
      localStorage.setItem('convocation_user', JSON.stringify(userWithRole));
      
    } catch (error) {
      console.error('Error handling session:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string, deviceType: 'mobile' | 'desktop' = 'desktop') => {
    try {
      setIsLoading(true);
      console.log(`Attempting login with email: ${email}, device: ${deviceType}`);
      
      // Check if this email exists in the Teacher's List table to determine role
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq.${email},"Folder Email ID".eq.${email}`);
        
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
      }
      
      // Sign in using Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        // If teacher data was found, determine role
        let userRole: Role = 'presenter'; // Default role
        
        if (teacherData && teacherData.length > 0) {
          const teacher = teacherData[0];
          if (teacher["Robe Email ID"] === email) {
            userRole = 'robe-in-charge';
          } else if (teacher["Folder Email ID"] === email) {
            userRole = 'folder-in-charge';
          }
        }
        
        // Update user metadata with role
        await supabase.auth.updateUser({
          data: {
            role: userRole,
            name: email.split('@')[0].replace(/\./g, ' '),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
          }
        });
      
        // Get user data from the session
        await handleSession(data.session);
        
        // We need to get the user after handleSession sets it
        const currentUser = JSON.parse(localStorage.getItem('convocation_user') || 'null');
        
        if (currentUser) {
          // Log device usage
          await logDeviceUsage(currentUser, deviceType);
          console.log(`Logged in successfully as ${currentUser.name} using ${deviceType} device`);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${currentUser.name}!`,
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Login error:', errorMessage);
      
      toast({
        title: 'Login failed',
        description: errorMessage || 'Invalid email or password.',
        variant: 'destructive',
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem('convocation_user');
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out.',
        variant: 'destructive',
      });
    }
  };

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
