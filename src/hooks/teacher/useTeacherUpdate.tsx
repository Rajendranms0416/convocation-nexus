
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { updateDynamicTable, updateTeachersTable } from '@/utils/dynamicTableHelpers';
import { DynamicTableInsert } from '@/integrations/supabase/custom-types';

/**
 * Hook for updating teacher functionality
 */
export const useTeacherUpdate = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleUpdateTeacher = async (
    teacher: any,
    name: string,
    email: string,
    role: Role,
    classes: string[]
  ) => {
    try {
      // Create updated teacher object
      const updatedTeacher = {
        ...teacher,
        name,
        email,
        role,
        assignedClasses: classes
      };

      // Remove 'updated_at' from insert operations to match DynamicTableInsert
      const updateData: DynamicTableInsert = {
        Programme_Name: classes[0] || '',
        Robe_Email_ID: role === 'robe-in-charge' ? email : '',
        Folder_Email_ID: role === 'folder-in-charge' ? email : '',
        Accompanying_Teacher: role === 'robe-in-charge' ? name : '',
        Folder_in_Charge: role === 'folder-in-charge' ? name : ''
      };

      // Update in the database if we have a DB ID
      if (teacher.dbId) {
        if (teacher.dbTable) {
          // Update in the dynamic table
          const { error } = await updateDynamicTable(teacher.dbTable, updateData, teacher.dbId);
          if (error) throw error;
        } else {
          // Update in the main teachers table
          const teachersUpdate = {
            "Programme Name": classes[0] || '',
            "Robe Email ID": role === 'robe-in-charge' ? email : '',
            "Folder Email ID": role === 'folder-in-charge' ? email : '',
            "Robe in Charge": role === 'robe-in-charge' ? name : '',
            "Folder in Charge": role === 'folder-in-charge' ? name : ''
          };
          
          const { error } = await updateTeachersTable(teachersUpdate, teacher.dbId);
          if (error) throw error;
        }
      }

      // Update in state
      const updatedTeachers = teachers.map(t => {
        if (t.id === teacher.id) {
          return updatedTeacher;
        }
        return t;
      });
      
      setTeachers(updatedTeachers);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Teacher Updated",
        description: `${name} has been updated successfully`,
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({
        title: "Error Updating Teacher",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleUpdateTeacher
  };
};
