
import { useTeacherState } from './teacher/useTeacherState';
import { useTeacherOperations } from './teacher/useTeacherOperations';
import { useClassAssignment } from './teacher/useClassAssignment';
import { useTeacherActions } from './teacher/useTeacherActions';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseInfo {
  id: string;
  tableName: string;
  session: string;
  uploadDate: string;
  recordCount: number;
}

/**
 * Main hook for teacher management functionality
 * Provides a unified API for all teacher operations
 */
export const useTeacherManagement = () => {
  // Get the base state
  const teacherState = useTeacherState();
  
  // Extract state properties
  const {
    teachers,
    setTeachers,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isClassAssignDialogOpen, 
    setIsClassAssignDialogOpen,
    currentTeacher,
    setCurrentTeacher,
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail, 
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    availableClasses,
    selectedClasses,
    setSelectedClasses,
    loadTeacherData
  } = teacherState;

  // Get base operations
  const { 
    handleAddTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher
  } = useTeacherOperations(
    teachers, 
    setTeachers, 
    setIsEditDialogOpen
  );

  const { 
    handleAssignClasses: baseHandleAssignClasses, 
    saveClassAssignments: baseSaveClassAssignments 
  } = useClassAssignment(
    teachers, 
    setTeachers, 
    setIsClassAssignDialogOpen
  );

  // Get high-level actions that coordinate state and operations
  const {
    handleEditTeacher,
    wrappedHandleUpdateTeacher,
    wrappedHandleAssignClasses,
    wrappedSaveClassAssignments
  } = useTeacherActions({
    currentTeacher,
    setCurrentTeacher,
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail,
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    selectedClasses,
    setSelectedClasses,
    setIsEditDialogOpen,
    handleUpdateTeacher,
    baseHandleAssignClasses,
    baseSaveClassAssignments
  });

  return {
    // State
    teachers,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isClassAssignDialogOpen,
    setIsClassAssignDialogOpen,
    currentTeacher,
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail,
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    availableClasses,
    selectedClasses,
    setSelectedClasses,
    
    // Actions
    handleAddTeacher,
    handleEditTeacher,
    handleUpdateTeacher: wrappedHandleUpdateTeacher,
    handleDeleteTeacher,
    handleAssignClasses: wrappedHandleAssignClasses,
    saveClassAssignments: wrappedSaveClassAssignments,
    loadTeacherData,
  };
};
