
import React from 'react';
import EditTeacherDialog from '@/components/admin/teachers/EditTeacherDialog';
import ClassAssignmentDialog from '@/components/admin/teachers/ClassAssignmentDialog';
import { Role } from '@/types';

interface DialogsContainerProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isClassAssignDialogOpen: boolean;
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  currentTeacher: any;
  newTeacherName: string;
  setNewTeacherName: React.Dispatch<React.SetStateAction<string>>;
  newTeacherEmail: string;
  setNewTeacherEmail: React.Dispatch<React.SetStateAction<string>>;
  newTeacherRole: Role;
  setNewTeacherRole: React.Dispatch<React.SetStateAction<Role>>;
  emailType: 'robe' | 'folder' | 'presenter'; // Updated to include 'presenter'
  setEmailType: React.Dispatch<React.SetStateAction<'robe' | 'folder' | 'presenter'>>; // Updated to include 'presenter'
  availableClasses: string[];
  selectedClasses: string[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  onUpdateTeacher: () => void;
  onSaveClassAssignments: (teacher: any, selectedClasses: string[]) => void;
}

const DialogsContainer: React.FC<DialogsContainerProps> = ({
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
  onUpdateTeacher,
  onSaveClassAssignments
}) => {
  return (
    <>
      <EditTeacherDialog 
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        teacher={currentTeacher}
        availableClasses={availableClasses}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        teacherName={newTeacherName}
        setTeacherName={setNewTeacherName}
        teacherEmail={newTeacherEmail}
        setTeacherEmail={setNewTeacherEmail}
        emailType={emailType}
        setEmailType={setEmailType}
        onUpdate={onUpdateTeacher}
        setTeacherRole={setNewTeacherRole}
      />

      <ClassAssignmentDialog 
        isOpen={isClassAssignDialogOpen}
        onClose={() => setIsClassAssignDialogOpen(false)}
        teacher={currentTeacher}
        availableClasses={availableClasses}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        onSave={onSaveClassAssignments}
      />
    </>
  );
};

export default DialogsContainer;
