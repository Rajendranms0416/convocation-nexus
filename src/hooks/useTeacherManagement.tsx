
import { useTeacherState } from './teacher/useTeacherState';
import { useTeacherOperations } from './teacher/useTeacherOperations';
import { useClassAssignment } from './teacher/useClassAssignment';

export const useTeacherManagement = () => {
  const teacherState = useTeacherState();
  
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
    setSelectedClasses
  } = teacherState;

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

  // Wrapper functions to simplify the API
  const handleEditTeacher = (teacher: any) => {
    setCurrentTeacher(teacher);
    setNewTeacherName(teacher.name);
    setNewTeacherEmail(teacher.email);
    setNewTeacherRole(teacher.role);
    setEmailType(teacher.role === 'robe-in-charge' ? 'robe' : 'folder');
    setSelectedClasses(teacher.assignedClasses || []);
    setIsEditDialogOpen(true);
  };

  const wrappedHandleUpdateTeacher = () => {
    handleUpdateTeacher(
      currentTeacher,
      newTeacherName,
      newTeacherEmail,
      newTeacherRole,
      selectedClasses
    );
  };

  const wrappedHandleAssignClasses = (teacher: any) => {
    baseHandleAssignClasses(teacher, setCurrentTeacher, setSelectedClasses);
  };

  const wrappedSaveClassAssignments = () => {
    baseSaveClassAssignments(currentTeacher, selectedClasses);
  };

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
    saveClassAssignments: wrappedSaveClassAssignments
  };
};
