
import { User, Role } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SUPER_ADMIN_EMAIL } from '@/types/auth';

export const handleSession = async (session: Session): Promise<User | null> => {
  try {
    const { 
      user: authUser, 
    } = session;
    
    if (!authUser) {
      console.log('No auth user in session');
      return null;
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
      localStorage.setItem('convocation_user', JSON.stringify(userWithRole));
      return userWithRole;
    }
    
    const { data: teacherData, error: teacherError } = await supabase
      .from('Teacher\'s List')
      .select('*')
      .or(`"Robe Email ID".eq."${authUser.email}","Folder Email ID".eq."${authUser.email}"`);
      
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
    localStorage.setItem('convocation_user', JSON.stringify(userWithRole));
    
    return userWithRole;
  } catch (error) {
    console.error('Error handling session:', error);
    return null;
  }
};

export const createAdminUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
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
  
  return { data, error };
};

export const findTeacherByEmail = async (email: string) => {
  const { data: teacherData, error: teacherError } = await supabase
    .from('Teacher\'s List')
    .select('*')
    .or(`"Robe Email ID".eq."${email}","Folder Email ID".eq."${email}"`);
    
  return { teacherData, teacherError };
};

export const determineUserRole = (teacher: any, email: string): Role => {
  if (teacher["Robe Email ID"] === email) {
    return 'robe-in-charge';
  } else if (teacher["Folder Email ID"] === email) {
    return 'folder-in-charge';
  }
  return 'presenter'; // Default role
};
