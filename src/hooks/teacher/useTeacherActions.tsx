
import { Role } from '@/types';

type TeacherActionsProps = {
  currentTeacher: any;
  setCurrentTeacher: (teacher: any) => void;
  newTeacherName: string;
  setNewTeacherName: (name: string) => void;
  newTeacherEmail: string;
  setNewTeacherEmail: (email: string) => void;
  newTeacherRole: Role;
  setNewTeacherRole: (role: Role) => void;
  emailType: 'robe' | 'folder';
  setEmailType: (type: 'robe' | 'folder') => void;
  selectedClasses: string[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  setIsEditDialogOpen: (isOpen: boolean) => void;
  handleUpdateTeacher: (
    teacher: any,
    name: string,
    email: string,
    role: Role,
    classes: string[]
  ) => void;
  baseHandleAssignClasses: (
    teacher: any,
    setTeacher: React.Dispatch<React.SetStateAction<any>>,
    setClasses: React.Dispatch<React.SetStateAction<string[]>>
  ) => void;
  baseSaveClassAssignments: (
    teacher: any,
    classes: string[]
  ) => void;
};

/**
 * Hook that provides higher-level teacher actions by combining state and operations
 */
export const useTeacherActions = ({
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
}: TeacherActionsProps) => {
  // Prepare teacher data for editing
  const handleEditTeacher = (teacher: any) => {
    setCurrentTeacher(teacher);
    setNewTeacherName(teacher.name);
    setNewTeacherEmail(teacher.email);
    setNewTeacherRole(teacher.role);
    setEmailType(teacher.role === 'robe-in-charge' ? 'robe' : 'folder');
    setSelectedClasses(teacher.assignedClasses || []);
    setIsEditDialogOpen(true);
  };

  // Update teacher with current form state
  const wrappedHandleUpdateTeacher = () => {
    handleUpdateTeacher(
      currentTeacher,
      newTeacherName,
      newTeacherEmail,
      newTeacherRole,
      selectedClasses
    );
  };

  // Prepare class assignment for a teacher
  const wrappedHandleAssignClasses = (teacher: any) => {
    baseHandleAssignClasses(teacher, setCurrentTeacher, setSelectedClasses);
  };

  // Save class assignments with current selection
  const wrappedSaveClassAssignments = () => {
    baseSaveClassAssignments(currentTeacher, selectedClasses);
  };

  return {
    handleEditTeacher,
    wrappedHandleUpdateTeacher,
    wrappedHandleAssignClasses,
    wrappedSaveClassAssignments
  };
};
