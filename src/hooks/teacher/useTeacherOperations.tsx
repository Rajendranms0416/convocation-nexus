
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage teacher operations (add, edit, delete)
 */
export const useTeacherOperations = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleAddTeacher = async (
    name: string, 
    email: string, 
    role: Role, 
    emailType: 'robe' | 'folder', 
    classes: string[]
  ) => {
    if (!name || !email || !role) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a new teacher entry in the Excel-compatible format
      const newTeacherRaw: Record<string, string> = {
        "Programme Name": classes[0] || '',
        "Robe Email ID": emailType === 'robe' ? email : '',
        "Folder Email ID": emailType === 'folder' ? email : '',
        "Accompanying Teacher": emailType === 'robe' ? name : '',
        "Folder in Charge": emailType === 'folder' ? name : '',
        "Class Wise/\nSection Wise": '',
      };
      
      // Insert into database
      const { data: insertedTeacher, error } = await supabase
        .from('teachers')
        .insert({
          program_name: classes[0] || '',
          robe_email: emailType === 'robe' ? email : '',
          folder_email: emailType === 'folder' ? email : '',
          accompanying_teacher: emailType === 'robe' ? name : '',
          folder_in_charge: emailType === 'folder' ? name : '',
          class_section: '',
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get the current teachers list and add the new teacher for local storage
      const currentTeachers = getAllTeachers();
      const updatedTeachers = [...currentTeachers, newTeacherRaw];
      updateTeachersList(updatedTeachers);
      
      // Format for the UI table
      const newTeacherFormatted = {
        id: (teachers.length + 1).toString(),
        name: name,
        email: email,
        role: role,
        program: classes[0] || '',
        assignedClasses: classes,
        rawData: newTeacherRaw
      };
      
      setTeachers([...teachers, newTeacherFormatted]);
      
      toast({
        title: "Teacher Added",
        description: `${name} has been added as ${role}`,
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error Adding Teacher",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

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
      const { error } = await supabase
        .from('teachers')
        .update({
          program_name: selectedClasses[0] || '',
          robe_email: newTeacherRole === 'robe-in-charge' ? newTeacherEmail : '',
          folder_email: newTeacherRole === 'folder-in-charge' ? newTeacherEmail : '',
          accompanying_teacher: newTeacherRole === 'robe-in-charge' ? newTeacherName : '',
          folder_in_charge: newTeacherRole === 'folder-in-charge' ? newTeacherName : '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentTeacher.dbId || '');
      
      if (error) {
        console.error('Supabase update error:', error);
        // Continue anyway to update local storage
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

  const handleDeleteTeacher = async (id: string) => {
    try {
      // Find the teacher to delete
      const teacherIndex = teachers.findIndex(t => t.id === id);
      
      if (teacherIndex !== -1) {
        // Get the teacher for database deletion
        const teacher = teachers[teacherIndex];
        
        // Delete from database if we have the DB ID
        if (teacher.dbId) {
          const { error } = await supabase
            .from('teachers')
            .delete()
            .eq('id', teacher.dbId);
            
          if (error) {
            console.error('Supabase delete error:', error);
            // Continue anyway to update UI and local storage
          }
        }
        
        // Remove from the UI
        const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
        setTeachers(updatedTeachers);
        
        // Remove from local storage
        const allTeachers = getAllTeachers();
        const storageIndex = parseInt(id) - 1;
        
        if (storageIndex >= 0 && storageIndex < allTeachers.length) {
          const newTeachersList = [...allTeachers];
          newTeachersList.splice(storageIndex, 1);
          updateTeachersList(newTeachersList);
        }
        
        toast({
          title: "Teacher Removed",
          description: "The teacher has been removed from the system",
        });
      }
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error Deleting Teacher",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
  };
};
