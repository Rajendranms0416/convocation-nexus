
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { handleSession, createAdminUser, findTeacherByEmail, determineUserRole } from '@/utils/authHelpers';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const login = async (email: string, password: string, deviceType: 'mobile' | 'desktop' = 'desktop') => {
    try {
      setIsLoading(true);
      console.log(`Attempting login with email: ${email}, device: ${deviceType}`);
      
      // Handle super admin login
      if (email === SUPER_ADMIN_EMAIL) {
        console.log('Attempting super admin login');
        if (password !== SUPER_ADMIN_PASSWORD) {
          throw new Error('Invalid admin credentials');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error && error.message === 'Invalid login credentials') {
          const { data: signUpData, error: signUpError } = await createAdminUser(email, password);
          
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
      
      // Check if email is in Teacher's List - Fix: properly format the SQL query
      const { data: teacherData, error: teacherError } = await supabase
        .from('Teacher\'s List')
        .select('*')
        .or(`"Robe Email ID".eq."${email}","Folder Email ID".eq."${email}"`);
      
      console.log('Teacher check result:', { teacherData, teacherError });
        
      if (teacherError) {
        console.error('Error checking teacher list:', teacherError);
        throw new Error('Error verifying teacher credentials');
      }
      
      if (!teacherData || teacherData.length === 0) {
        console.error('Email not found in teacher list:', email);
        throw new Error('Email not found in authorized teachers list');
      }
      
      console.log('Teacher found in database:', teacherData[0]);
      
      // Check if user exists and try login
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
          console.error('Signup error:', signUpError);
          throw signUpError;
        }
        
        toast({
          title: 'Account created',
          description: 'You have been signed up and logged in automatically.',
        });
      } else if (checkError) {
        console.error('Login error:', checkError);
        throw checkError;
      }
      
      let userRole = determineUserRole(teacherData[0], email);

      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData && sessionData.session) {
        await supabase.auth.updateUser({
          data: {
            role: userRole,
            name: email.split('@')[0].replace(/\./g, ' '),
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
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
