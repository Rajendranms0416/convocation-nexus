
import { User, Role } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SUPER_ADMIN_EMAIL } from '@/types/auth';

// Mock data to replace the database queries - this would be your Excel sheet data
const TEACHERS_LIST = [
  {
    "Programme Name": "BCA",
    "Robe Email ID": "john.doe@convocation.edu",
    "Folder Email ID": "jane.smith@convocation.edu"
  },
  {
    "Programme Name": "MCA",
    "Robe Email ID": "alex.johnson@convocation.edu",
    "Folder Email ID": "sara.williams@convocation.edu"
  },
  // Add more teacher entries as needed
];

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
    
    const email = authUser.email || '';
    
    // Find teacher in the TEACHERS_LIST (Excel data)
    const teacher = TEACHERS_LIST.find(teacher => 
      teacher["Robe Email ID"] === email || teacher["Folder Email ID"] === email
    );
    
    console.log('Teacher data from Excel:', teacher);
    
    let userRole: Role = 'presenter'; // Default role
    
    if (teacher) {
      console.log('Found teacher:', teacher);
      
      if (teacher["Robe Email ID"] === email) {
        userRole = 'robe-in-charge';
      } else if (teacher["Folder Email ID"] === email) {
        userRole = 'folder-in-charge';
      }
    } else {
      console.log('No teacher found for email:', email);
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

// Determine user role from Excel data
export const determineUserRole = (teacher: any, email: string): Role => {
  console.log('Determining role for email:', email, 'teacher data:', teacher);
  
  if (!teacher) return 'presenter'; // Default role if no teacher is found
  
  if (teacher["Robe Email ID"] === email) {
    return 'robe-in-charge';
  } else if (teacher["Folder Email ID"] === email) {
    return 'folder-in-charge';
  }
  return 'presenter'; // Default role
};

// Check if email exists in the teachers list
export const verifyTeacherEmail = (email: string): boolean => {
  const exists = TEACHERS_LIST.some(teacher => 
    teacher["Robe Email ID"] === email || teacher["Folder Email ID"] === email
  );
  console.log(`Email ${email} verified in teachers list:`, exists);
  return exists;
};

// Get teacher data for a specific email
export const getTeacherByEmail = (email: string): any => {
  return TEACHERS_LIST.find(teacher => 
    teacher["Robe Email ID"] === email || teacher["Folder Email ID"] === email
  );
};
