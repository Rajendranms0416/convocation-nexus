
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { useTeacherAdd } from './useTeacherAdd';
import { useTeacherUpdate } from './useTeacherUpdate';
import { useTeacherDelete } from './useTeacherDelete';
import { useClassAssignment } from './useClassAssignment';

/**
 * Hook to manage teacher operations (add, edit, delete)
 * This is now a composition of smaller, more focused hooks
 */
export const useTeacherOperations = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // Use the smaller hooks
  const { handleAddTeacher } = useTeacherAdd(teachers, setTeachers);
  const { handleUpdateTeacher } = useTeacherUpdate(teachers, setTeachers, setIsEditDialogOpen);
  const { handleDeleteTeacher } = useTeacherDelete(teachers, setTeachers);
  const { handleAssignClasses, saveClassAssignments } = useClassAssignment(
    teachers,
    setTeachers,
    setIsClassAssignDialogOpen
  );

  return {
    handleAddTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleAssignClasses,
    saveClassAssignments
  };
};
