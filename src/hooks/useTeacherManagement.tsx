
import { useTeacherState } from './teacher/useTeacherState';
import { useTeacherOperations } from './teacher/useTeacherOperations';
import { useTeacherActions } from './teacher/useTeacherActions';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '@/types';

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

  // Get base operations - ensure the types match what's needed
  const { 
    handleAddTeacher,
    handleUpdateTeacher: baseHandleUpdateTeacher,
    handleDeleteTeacher,
    handleAssignClasses: baseHandleAssignClasses,
    saveClassAssignments: baseSaveClassAssignments
  } = useTeacherOperations(
    teachers, 
    setTeachers,
    setIsEditDialogOpen,
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
    // Create wrapper function to adapt the incompatible function signatures
    handleUpdateTeacher: (teacher, name, email, role, classes) => {
      return baseHandleUpdateTeacher(teacher.id, name, email, role);
    },
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
