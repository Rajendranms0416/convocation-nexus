
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
    
    // Determine the email type based on the role
    const emailType = 
      newTeacherRole === 'robe-in-charge' ? 'robe' : 
      newTeacherRole === 'folder-in-charge' ? 'folder' : 'presenter';
    
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
      const updateData: Record<string, any> = {
        program_name: selectedClasses[0] || '',
        updated_at: new Date().toISOString(),
      };
      
      // Set the appropriate email and name fields based on role
      if (newTeacherRole === 'robe-in-charge') {
        updateData.robe_email = newTeacherEmail;
        updateData.robe_in_charge = newTeacherName;
      } else if (newTeacherRole === 'folder-in-charge') {
        updateData.folder_email = newTeacherEmail;
        updateData.folder_in_charge = newTeacherName;
      } else if (newTeacherRole === 'presenter') {
        updateData.presenter_email = newTeacherEmail;
        updateData.presenter = newTeacherName;
      }
      
      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', currentTeacher.dbId || '');
      
      if (error) {
        console.error('Supabase update error:', error);
        // Continue anyway to update local storage
      }
      
      // Update in local storage
      const allTeachers = getAllTeachers();
      const index = parseInt(currentTeacher.id) - 1;
      
      if (index >= 0 && index < allTeachers.length) {
        // Create a new teacher object with updated fields based on role
        const updatedTeacher = {
          ...allTeachers[index],
          "Programme Name": selectedClasses[0] || allTeachers[index]["Programme Name"],
          "Robe Email ID": '',
          "Folder Email ID": '',
          "Presenter Email ID": '',
          "Accompanying Teacher": '',
          "Folder in Charge": '',
          "Presenter": ''
        };
        
        // Set appropriate fields based on role
        if (newTeacherRole === 'robe-in-charge') {
          updatedTeacher["Robe Email ID"] = newTeacherEmail;
          updatedTeacher["Accompanying Teacher"] = newTeacherName;
        } else if (newTeacherRole === 'folder-in-charge') {
          updatedTeacher["Folder Email ID"] = newTeacherEmail;
          updatedTeacher["Folder in Charge"] = newTeacherName;
        } else if (newTeacherRole === 'presenter') {
          updatedTeacher["Presenter Email ID"] = newTeacherEmail;
          updatedTeacher["Presenter"] = newTeacherName;
        }
        
        allTeachers[index] = updatedTeacher;
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
