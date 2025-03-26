
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { getAllSessions } from '@/utils/authHelpers';
import RoleAssignmentHeader from '@/components/admin/teachers/RoleAssignmentHeader';
import TeacherManagementContent from '@/components/admin/teachers/TeacherManagementContent';
import DialogsContainer from '@/components/admin/teachers/DialogsContainer';
import RoleAssignmentGuard from '@/components/admin/teachers/RoleAssignmentGuard';
import SessionDataLoader from '@/components/admin/teachers/SessionDataLoader';
import { useRoleAssignmentCallbacks } from '@/components/admin/teachers/RoleAssignmentCallbacks';

const RoleAssignment: React.FC = () => {
  // State for sessions
  const [currentSession, setCurrentSession] = useState<string>("April 22, 2023 - Morning (09:00 AM)");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  
  // Get teacher management functionality
  const teacherManagement = useTeacherManagement();
  
  // Destructure needed properties and functions from teacherManagement
  const {
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
    handleAddTeacher,
    handleEditTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleAssignClasses,
    saveClassAssignments,
    loadTeacherData
  } = teacherManagement;

  // Get callback handlers
  const {
    handleSessionChange,
    handleRefresh,
    handleDataLoaded
  } = useRoleAssignmentCallbacks({
    currentSession,
    setCurrentSession,
    loadTeacherData
  });

  return (
    <RoleAssignmentGuard>
      <SessionDataLoader
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
        availableSessions={availableSessions}
        setAvailableSessions={setAvailableSessions}
        loadTeacherData={loadTeacherData}
      >
        <div className="container mx-auto p-4 max-w-6xl">
          <Card className="mb-6">
            <RoleAssignmentHeader 
              onRefresh={handleRefresh}
              isRefreshing={false} // This gets updated by SessionDataLoader
            />
            
            <TeacherManagementContent
              sessions={availableSessions}
              currentSession={currentSession}
              onSessionChange={handleSessionChange}
              isRefreshing={false} // This gets updated by SessionDataLoader
              onRefresh={handleRefresh}
              teachers={teachers}
              availableClasses={availableClasses}
              onAddTeacher={handleAddTeacher}
              onEditTeacher={handleEditTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              onAssignClasses={handleAssignClasses}
              onDataLoaded={handleDataLoaded}
            />
          </Card>

          <DialogsContainer
            isEditDialogOpen={isEditDialogOpen}
            setIsEditDialogOpen={setIsEditDialogOpen}
            isClassAssignDialogOpen={isClassAssignDialogOpen}
            setIsClassAssignDialogOpen={setIsClassAssignDialogOpen}
            currentTeacher={currentTeacher}
            newTeacherName={newTeacherName}
            setNewTeacherName={setNewTeacherName}
            newTeacherEmail={newTeacherEmail}
            setNewTeacherEmail={setNewTeacherEmail}
            newTeacherRole={newTeacherRole}
            setNewTeacherRole={setNewTeacherRole}
            emailType={emailType}
            setEmailType={setEmailType}
            availableClasses={availableClasses}
            selectedClasses={selectedClasses}
            setSelectedClasses={setSelectedClasses}
            onUpdateTeacher={handleUpdateTeacher}
            onSaveClassAssignments={saveClassAssignments}
          />
        </div>
      </SessionDataLoader>
    </RoleAssignmentGuard>
  );
};

export default RoleAssignment;
