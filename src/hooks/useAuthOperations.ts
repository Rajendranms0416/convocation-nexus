
import { useState } from 'react';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { 
  handleSession, 
  createAdminUser, 
  determineUserRole, 
  verifyTeacherEmail,
  getTeacherByEmail,
  loadTeachersFromStorage 
} from '@/utils/authHelpers';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } from '@/types/auth';

export const useAuthOperations = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Make sure we load any teachers data from storage when the hook is initialized
  loadTeachersFromStorage();

  const login = async (
    email: string, 
    password: string, 
    deviceType: 'mobile' | 'desktop' = 'desktop', 
    loginMode: 'teacher' | 'admin' = 'teacher'
  ) => {
    try {
      setIsLoading(true);
      // Strip whitespace from email
      const cleanEmail = email.trim();
      console.log(`Attempting login with email: ${cleanEmail}, device: ${deviceType}, mode: ${loginMode}`);
      
      // Handle super admin login
      if (cleanEmail === SUPER_ADMIN_EMAIL || loginMode === 'admin') {
        console.log('Attempting admin login');
        
        // For admin login, just check the hardcoded password
        if (cleanEmail === SUPER_ADMIN_EMAIL && password !== SUPER_ADMIN_PASSWORD) {
          throw new Error('Invalid admin credentials');
        }
        
        // Create admin user object without actually signing up in Supabase
        const adminUser: User = {
          id: 'admin-user-id', // Using a placeholder ID for admin
          name: 'Super Admin',
          email: SUPER_ADMIN_EMAIL,
          role: 'super-admin',
          avatar: `https://ui-avatars.com/api/?name=Super+Admin&background=random&color=fff`,
        };
        
        // Set the admin user in state
        setUser(adminUser);
        
        // Store admin user in localStorage for persistence
        localStorage.setItem('convocation_user', JSON.stringify(adminUser));
        
        toast({
          title: 'Admin Login successful',
          description: 'Welcome, Super Admin!',
        });
        
        setIsLoading(false);
        return;
      }
      
      // If not admin login, proceed with teacher login flow
      // First check if the email exists in teacher list before signup/login
      const isTeacher = verifyTeacherEmail(cleanEmail);
      
      if (!isTeacher) {
        console.error('Email not found in teacher list:', cleanEmail);
        throw new Error('Email not found in authorized teachers list');
      }
      
      const teacher = getTeacherByEmail(cleanEmail);
      console.log('Teacher found:', teacher);
      
      // For simplicity in this prototype, we'll skip the actual Supabase auth
      // and create a user object directly
      if (password !== 'password123') {
        throw new Error('Invalid password. Default password is password123.');
      }
      
      // Determine user role from Excel data
      let userRole = determineUserRole(teacher, cleanEmail);
      console.log('Determined role:', userRole);

      // Create teacher user
      const teacherUser: User = {
        id: `teacher-${Date.now()}`, // Generate a temporary ID
        name: cleanEmail.split('@')[0].replace(/\./g, ' '),
        email: cleanEmail,
        role: userRole,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanEmail.split('@')[0].replace(/\./g, '+'))}&background=random&color=fff`
      };
      
      // Set the user
      setUser(teacherUser);
      
      // Store in localStorage
      localStorage.setItem('convocation_user', JSON.stringify(teacherUser));
      
      // Log device usage
      await logDeviceUsage(teacherUser, deviceType);
      console.log(`Logged in successfully as ${teacherUser.name} using ${deviceType} device`);
      
      toast({
        title: 'Login successful',
        description: `Welcome back, ${teacherUser.name}!`,
      });
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
      // No need to call Supabase signOut in this prototype
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
