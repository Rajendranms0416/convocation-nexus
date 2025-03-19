
import { useToast } from '@/hooks/use-toast';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for deleting teacher functionality
 */
export const useTeacherDelete = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const { toast } = useToast();

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
    handleDeleteTeacher
  };
};
