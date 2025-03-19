
import { User, Role } from '@/types';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { SUPER_ADMIN_EMAIL } from '@/types/auth';

// Initialize with mock data, but allow it to be updated
let TEACHERS_LIST = [
  {
    "Programme Name": "BCA",
    "Robe Email ID": "john.doe@convocation.edu",
    "Folder Email ID": "jane.smith@convocation.edu",
    "Accompanying Teacher": "John Doe",
    "Folder in Charge": "Jane Smith"
  },
  {
    "Programme Name": "MCA",
    "Robe Email ID": "alex.johnson@convocation.edu",
    "Folder Email ID": "sara.williams@convocation.edu",
    "Accompanying Teacher": "Alex Johnson",
    "Folder in Charge": "Sara Williams"
  },
  // Add more teacher entries as needed
];

// Function to update the teachers list with new data
export const updateTeachersList = (newData: any[]) => {
  // Ensure each teacher has all required fields before saving
  const completeData = newData.map(teacher => {
    const enhancedTeacher = { ...teacher };
    
    // Ensure all required fields exist
    if (!enhancedTeacher['Programme Name']) enhancedTeacher['Programme Name'] = '';
    if (!enhancedTeacher['Robe Email ID']) enhancedTeacher['Robe Email ID'] = '';
    if (!enhancedTeacher['Folder Email ID']) enhancedTeacher['Folder Email ID'] = '';
    if (!enhancedTeacher['Accompanying Teacher']) enhancedTeacher['Accompanying Teacher'] = '';
    if (!enhancedTeacher['Folder in Charge']) enhancedTeacher['Folder in Charge'] = '';
    
    return enhancedTeacher;
  });
  
  // Filter out teachers that have neither robe nor folder email (likely invalid entries)
  const validTeachers = completeData.filter(teacher => 
    (teacher['Robe Email ID'] && teacher['Robe Email ID'].includes('@')) || 
    (teacher['Folder Email ID'] && teacher['Folder Email ID'].includes('@'))
  );
  
  console.log('Saving teachers list with valid entries:', validTeachers.length);
  
  TEACHERS_LIST = validTeachers;
  // Store in localStorage for persistence across page refreshes
  localStorage.setItem('convocation_teachers', JSON.stringify(validTeachers));
  console.log('Updated teachers list:', TEACHERS_LIST);
  return TEACHERS_LIST;
};

// Load teachers from localStorage if available
export const loadTeachersFromStorage = () => {
  const storedTeachers = localStorage.getItem('convocation_teachers');
  if (storedTeachers) {
    try {
      TEACHERS_LIST = JSON.parse(storedTeachers);
      console.log('Loaded teachers from storage:', TEACHERS_LIST);
    } catch (error) {
      console.error('Error parsing stored teachers:', error);
    }
  }
  return TEACHERS_LIST;
};

// Load stored teachers on module initialization
loadTeachersFromStorage();

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

// Get all teachers data
export const getAllTeachers = (): any[] => {
  return [...TEACHERS_LIST];
};
