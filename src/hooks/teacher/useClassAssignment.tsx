
import { useToast } from '@/hooks/use-toast';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage class assignments for teachers
 */
export const useClassAssignment = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleAssignClasses = (
    teacher: any,
    setCurrentTeacher: React.Dispatch<React.SetStateAction<any>>,
    setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCurrentTeacher(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setIsClassAssignDialogOpen(true);
  };

  const saveClassAssignments = async (
    currentTeacher: any,
    selectedClasses: string[]
  ) => {
    if (!currentTeacher) return;
    
    try {
      // Update in the UI
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === currentTeacher.id 
          ? { ...teacher, assignedClasses: selectedClasses } 
          : teacher
      );
      
      setTeachers(updatedTeachers);
      
      // Update in database
      if (currentTeacher.dbId) {
        const { error } = await supabase
          .from('teachers')
          .update({
            program_name: selectedClasses[0] || '',
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
      
      if (index >= 0 && index < allTeachers.length && selectedClasses.length > 0) {
        allTeachers[index] = {
          ...allTeachers[index],
          "Programme Name": selectedClasses[0] // Use first selected class as programme name
        };
        
        updateTeachersList(allTeachers);
      }
      
      toast({
        title: "Classes Assigned",
        description: `Updated class assignments for ${currentTeacher.name}`,
      });
      
      setIsClassAssignDialogOpen(false);
    } catch (error) {
      console.error('Error assigning classes:', error);
      toast({
        title: "Error Assigning Classes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleAssignClasses,
    saveClassAssignments,
  };
};
