
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

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
    currentTeacher: any,
    newTeacherName: string,
    newTeacherEmail: string,
    newTeacherRole: Role,
    selectedClasses: string[]
  ) => {
    if (!currentTeacher) return;
    
    try {
      // Update in the UI first
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === currentTeacher.id 
          ? { 
              ...teacher, 
              name: newTeacherName, 
              email: newTeacherEmail, 
              role: newTeacherRole,
              assignedClasses: selectedClasses
            } 
          : teacher
      );
      
      setTeachers(updatedTeachers);
      
      // Update in the database
      if (currentTeacher.dbId) {
        const { error } = await supabase
          .from('teachers')
          .update({
            Programme_Name: selectedClasses[0] || '',
            Robe_Email_ID: newTeacherRole === 'robe-in-charge' ? newTeacherEmail : '',
            Folder_Email_ID: newTeacherRole === 'folder-in-charge' ? newTeacherEmail : '',
            Accompanying_Teacher: newTeacherRole === 'robe-in-charge' ? newTeacherName : '',
            Folder_in_Charge: newTeacherRole === 'folder-in-charge' ? newTeacherName : '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentTeacher.dbId);
        
        if (error) {
          console.error('Supabase update error:', error);
          // Continue anyway to update local storage
        }
      }
      
      // Update in local storage
      const allTeachers = getAllTeachers();
      const index = parseInt(currentTeacher.id) - 1;
      
      if (index >= 0 && index < allTeachers.length) {
        allTeachers[index] = {
          ...allTeachers[index],
          "Programme Name": selectedClasses[0] || allTeachers[index]["Programme Name"],
          "Robe Email ID": newTeacherRole === 'robe-in-charge' ? newTeacherEmail : '',
          "Folder Email ID": newTeacherRole === 'folder-in-charge' ? newTeacherEmail : '',
          "Accompanying Teacher": newTeacherRole === 'robe-in-charge' ? newTeacherName : '',
          "Folder in Charge": newTeacherRole === 'folder-in-charge' ? newTeacherName : '',
        };
        
        updateTeachersList(allTeachers);
      }
      
      toast({
        title: "Teacher Updated",
        description: `${newTeacherName}'s information has been updated`,
      });
      
      setIsEditDialogOpen(false);
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
