
import { useTeacherDataLoader } from './useTeacherDataLoader';
import { useTeacherDialogState } from './useTeacherDialogState';
import { useTeacherFormState } from './useTeacherFormState';
import { useTeacherClassState } from './useTeacherClassState';

/**
 * Hook to manage teacher state - composed of smaller, focused hooks
 */
export const useTeacherState = () => {
  // Use the smaller hooks
  const { teachers, setTeachers, isLoading, loadTeacherData } = useTeacherDataLoader();
  
  const {
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    isClassAssignDialogOpen, setIsClassAssignDialogOpen,
    currentTeacher, setCurrentTeacher
  } = useTeacherDialogState();
  
  const {
    newTeacherName, setNewTeacherName,
    newTeacherEmail, setNewTeacherEmail,
    newTeacherRole, setNewTeacherRole,
    emailType, setEmailType
  } = useTeacherFormState();
  
  const {
    availableClasses, setAvailableClasses,
    selectedClasses, setSelectedClasses
  } = useTeacherClassState();
  
  return {
    // Teacher state
    teachers,
    setTeachers,
    isLoading,
    
    // Dialog states
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isClassAssignDialogOpen,
    setIsClassAssignDialogOpen,
    
    // Current teacher
    currentTeacher,
    setCurrentTeacher,
    
    // Form states
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail,
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    
    // Class states
    availableClasses,
    setAvailableClasses,
    selectedClasses,
    setSelectedClasses,
    
    // Actions
    loadTeacherData,
  };
};
