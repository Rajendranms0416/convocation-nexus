
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { handleSession, createAdminUser, determineUserRole } from '@/utils/authHelpers';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string, deviceType: 'mobile' | 'desktop' = 'desktop') => {
    try {
      setIsLoading(true);
      // Strip whitespace from email
      const cleanEmail = email.trim();
      console.log(`Attempting login with email: ${cleanEmail}, device: ${deviceType}`);
      
      // Handle super admin login
      if (cleanEmail === SUPER_ADMIN_EMAIL) {
        console.log('Attempting super admin login');
        if (password !== SUPER_ADMIN_PASSWORD) {
          throw new Error('Invalid admin credentials');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (error && error.message === 'Invalid login credentials') {
          console.log('Admin user not found, creating account');
          const { data: signUpData, error: signUpError } = await createAdminUser(cleanEmail, password);
          
          if (signUpError) throw signUpError;
          
          toast({
            title: 'Admin account created',
            description: 'You have been signed up as an administrator',
          });
          
          // Try logging in again after signup
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          
          if (loginError) throw loginError;
        } else if (error) {
          throw error;
        }
        
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData && sessionData.session) {
          const adminUser = await handleSession(sessionData.session);
          
          if (adminUser) {
            setUser(adminUser);
            await logDeviceUsage(adminUser, deviceType);
            
            toast({
              title: 'Admin Login successful',
              description: 'Welcome, Super Admin!',
            });
          }
        }
        
        setIsLoading(false);
        return;
      }
      
      // First check if the email exists in teacher list before signup/login
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq."${cleanEmail}","Folder Email ID".eq."${cleanEmail}"`);
      
      console.log('Teacher check result:', { teacherData, teacherError });
        
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
        throw new Error('Error verifying teacher credentials');
      }
      
      if (!teacherData || teacherData.length === 0) {
        console.error('Email not found in teacher list:', cleanEmail);
        throw new Error('Email not found in authorized teachers list');
      }
      
      console.log('Teacher found in database:', teacherData[0]);
      
      // Try login first
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      
      // If login fails due to non-existent user, sign up
      if (error && error.message.includes('Invalid login credentials')) {
        console.log('User not found, attempting to create account');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanEmail.split('@')[0].replace(/\./g, ' '),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
            }
          }
        });
        
        if (signUpError) {
          console.error('Signup error:', signUpError);
          throw signUpError;
        }
        
        // Try login again after signup
        const { error: loginAgainError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        
        if (loginAgainError) {
          console.error('Error logging in after signup:', loginAgainError);
          throw loginAgainError;
        }
        
        toast({
          title: 'Account created',
          description: 'You have been signed up and logged in automatically.',
        });
      } else if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      // Determine user role from teacher data
      let userRole = determineUserRole(teacherData[0], cleanEmail);
      console.log('Determined role:', userRole);

      // Get current session and update user data
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData && sessionData.session) {
        await supabase.auth.updateUser({
          data: {
            role: userRole,
            name: cleanEmail.split('@')[0].replace(/\./g, ' '),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
          }
        });
      
        const currentUser = await handleSession(sessionData.session);
        
        if (currentUser) {
          setUser(currentUser);
          await logDeviceUsage(currentUser, deviceType);
          console.log(`Logged in successfully as ${currentUser.name} using ${deviceType} device`);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${currentUser.name}!`,
          });
        } else {
          throw new Error('User not found after login');
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

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    login,
    logout
  };
};
