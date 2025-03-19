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

const SUPER_ADMIN_EMAIL = 'admin@convocation.edu';
const SUPER_ADMIN_PASSWORD = 'admin123';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session) {
        await handleSession(session);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: Session) => {
    try {
      const { 
        user: authUser, 
      } = session;
      
      if (!authUser) {
        console.log('No auth user in session');
        return;
      }
      
      console.log('Auth user from session:', authUser);
      
      if (authUser.email === SUPER_ADMIN_EMAIL) {
        const userWithRole: User = {
          id: authUser.id,
          name: 'Super Admin',
          email: authUser.email,
          role: 'super-admin',
          avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=random&color=fff`,
        };
        
        console.log('Setting user as super admin:', userWithRole);
        setUser(userWithRole);
        localStorage.setItem('convocation_user', JSON.stringify(userWithRole));
        return;
      }
      
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq.${authUser.email},"Folder Email ID".eq.${authUser.email}`);
        
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
      }
      
      let userRole: Role = 'presenter'; // Default role
      
      if (teacherData && teacherData.length > 0) {
        const teacher = teacherData[0];
        if (teacher["Robe Email ID"] === authUser.email) {
          userRole = 'robe-in-charge';
        } else if (teacher["Folder Email ID"] === authUser.email) {
          userRole = 'folder-in-charge';
        }
      }
      
      const userWithRole: User = {
        id: authUser.id,
        name: authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: userRole,
        avatar: authUser.user_metadata.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.user_metadata.name || authUser.email?.split('@')[0] || 'User')}&background=random&color=fff`,
      };
      
      console.log('Setting user with role:', userWithRole);
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
      
      if (email === SUPER_ADMIN_EMAIL) {
        if (password !== SUPER_ADMIN_PASSWORD) {
          throw new Error('Invalid admin credentials');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error && error.message === 'Invalid login credentials') {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: 'Super Admin',
                role: 'super-admin',
                avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=random&color=fff`
              }
            }
          });
          
          if (signUpError) throw signUpError;
          
          toast({
            title: 'Admin account created',
            description: 'You have been signed up as an administrator',
          });
        } else if (error) {
          throw error;
        }
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          await handleSession(sessionData.session);
          
          const adminUser: User = {
            id: sessionData.session.user.id,
            name: 'Super Admin',
            email: SUPER_ADMIN_EMAIL,
            role: 'super-admin',
            avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=random&color=fff`,
          };
          
          await logDeviceUsage(adminUser, deviceType);
          
          toast({
            title: 'Admin Login successful',
            description: 'Welcome, Super Admin!',
          });
        }
        
        setIsLoading(false);
        return;
      }
      
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq.${email},"Folder Email ID".eq.${email}`);
        
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
        throw new Error('Error verifying teacher credentials');
      }
      
      if (!teacherData || teacherData.length === 0) {
        console.error('Email not found in teacher list:', email);
        throw new Error('Email not found in authorized teachers list');
      }
      
      console.log('Teacher found in database:', teacherData[0]);
      
      const { data: existingUser, error: checkError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (checkError && checkError.message === 'Invalid login credentials') {
        console.log('User not found, attempting to create account');
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0].replace(/\./g, ' '),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
            }
          }
        });
        
        if (signUpError) {
          throw signUpError;
        }
        
        toast({
          title: 'Account created',
          description: 'You have been signed up and logged in automatically.',
        });
      } else if (checkError) {
        throw checkError;
      }
      
      let userRole: Role = 'presenter'; // Default role
      
      if (teacherData && teacherData.length > 0) {
        const teacher = teacherData[0];
        if (teacher["Robe Email ID"] === email) {
          userRole = 'robe-in-charge';
        } else if (teacher["Folder Email ID"] === email) {
          userRole = 'folder-in-charge';
        }
      }

      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData && sessionData.session) {
        await supabase.auth.updateUser({
          data: {
            role: userRole,
            name: email.split('@')[0].replace(/\./g, ' '),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
          }
        });
      
        await handleSession(sessionData.session);
        
        const currentUser = JSON.parse(localStorage.getItem('convocation_user') || 'null');
        
        if (currentUser) {
          await logDeviceUsage(currentUser, deviceType);
          console.log(`Logged in successfully as ${currentUser.name} using ${deviceType} device`);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${currentUser.name}!`,
          });
        } else {
          console.error('User not found in localStorage after login');
        }
      } else {
        throw new Error('No session after login attempt');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Login error:', error);
      
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
