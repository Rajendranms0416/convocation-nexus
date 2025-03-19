
import { useToast } from '@/hooks/use-toast';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';

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

  const saveClassAssignments = (
    currentTeacher: any,
    selectedClasses: string[]
  ) => {
    if (!currentTeacher) return;
    
    // Update in the UI
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === currentTeacher.id 
        ? { ...teacher, assignedClasses: selectedClasses } 
        : teacher
    );
    
    setTeachers(updatedTeachers);
    
    // Update in storage
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
  };

  return {
    handleAssignClasses,
    saveClassAssignments,
  };
};
