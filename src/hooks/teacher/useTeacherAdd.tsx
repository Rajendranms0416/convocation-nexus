
import { toast } from '@/hooks/use-toast';
import { queryDynamicTable, supabase } from '@/integrations/supabase/client';
import { DynamicTableInsert } from '@/integrations/supabase/custom-types';

/**
 * Hook to manage adding new teachers
 */
export const useTeacherAdd = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>
) => {
  /**
   * Add a new teacher to the database
   */
  const handleAddTeacher = async (
    name: string,
    email: string,
    role: string,
    emailType: string,
    classes: string[],
    tableName?: string
  ) => {
    try {
      let newTeacherId: number = teachers.length > 0 
        ? Math.max(...teachers.map(t => typeof t.id === 'number' ? t.id : 0)) + 1
        : 1;
      
      // Check if we're using a dynamic table (from file upload)
      if (tableName) {
        // Add to dynamic table
        const newTeacher: DynamicTableInsert = {
          Programme_Name: name,
          Robe_Email_ID: emailType === 'robe' ? email : '',
          Folder_Email_ID: emailType === 'folder' ? email : '',
          Accompanying_Teacher: role === 'accompanying' ? name : '',
          Folder_in_Charge: role === 'folder' ? name : '',
          Class_Section: classes.join(', ')
        };
        
        // Cast to any to avoid TypeScript errors with dynamic tables
        const { data, error } = await queryDynamicTable(tableName)
          .insert(newTeacher as any)
          .select();
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          newTeacherId = (data[0] as any).id;
        }
      } else {
        // Add to the standard teachers table
        const { data, error } = await supabase
          .from('teachers')
          .insert({
            "Programme Name": name,
            "Robe Email ID": emailType === 'robe' ? email : '',
            "Folder Email ID": emailType === 'folder' ? email : '',
            "Folder in Charge": role === 'folder' ? name : '',
            "Robe in Charge": role === 'robe' ? name : ''
          } as any)
          .select();
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          newTeacherId = (data[0] as any).id;
        }
      }
      
      // Create a new teacher object for the local state
      const newTeacher = tableName 
        ? {
            id: newTeacherId,
            Programme_Name: name,
            Robe_Email_ID: emailType === 'robe' ? email : '',
            Folder_Email_ID: emailType === 'folder' ? email : '',
            Accompanying_Teacher: role === 'accompanying' ? name : '',
            Folder_in_Charge: role === 'folder' ? name : '',
            Class_Section: classes.join(', '),
            tableName
          }
        : {
            id: newTeacherId,
            "Programme Name": name,
            "Robe Email ID": emailType === 'robe' ? email : '',
            "Folder Email ID": emailType === 'folder' ? email : '',
            "Folder in Charge": role === 'folder' ? name : '',
            "Robe in Charge": role === 'robe' ? name : ''
          };
      
      // Update the local state
      setTeachers([...teachers, newTeacher]);
      
      toast({
        title: 'Teacher added successfully',
        description: `Teacher "${name}" has been added to the database.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error adding teacher:', error);
      
      toast({
        title: 'Failed to add teacher',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  return {
    handleAddTeacher
  };
};
