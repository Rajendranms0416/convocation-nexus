
import { useState } from 'react';
import { useTeacherDataLoader } from './useTeacherDataLoader';
import { useTeacherDialogState } from './useTeacherDialogState';
import { useTeacherFormState } from './useTeacherFormState';
import { useTeacherClassState } from './useTeacherClassState';

/**
 * Hook to manage teacher state - composed of smaller, focused hooks
 */
export const useTeacherState = () => {
  // Create state for teachers
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Use the data loader hook with the setTeachers function
  const { loading: isLoading, error, loadTeacherData } = useTeacherDataLoader(setTeachers);
  
  // Use the smaller hooks
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
