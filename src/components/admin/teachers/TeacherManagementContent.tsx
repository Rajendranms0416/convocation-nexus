
import React from 'react';
import { CardContent } from '@/components/ui/card';
import ExcelUpload from '@/components/admin/ExcelUpload';
import TeachersList from '@/components/admin/teachers/TeachersList';
import AddTeacherDialog from '@/components/admin/teachers/AddTeacherDialog';
import SessionSelector from '@/components/admin/teachers/SessionSelector';

interface TeacherManagementContentProps {
  sessions: string[];
  currentSession: string;
  onSessionChange: (session: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  teachers: any[];
  availableClasses: string[];
  onAddTeacher: (name: string, email: string, role: string, emailType: string, classes: string[]) => void;
  onEditTeacher: (teacher: any) => void;
  onDeleteTeacher: (id: string) => void;
  onAssignClasses: (teacher: any) => void;
}

const TeacherManagementContent: React.FC<TeacherManagementContentProps> = ({
  sessions,
  currentSession,
  onSessionChange,
  isRefreshing,
  onRefresh,
  teachers,
  availableClasses,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  onAssignClasses
}) => {
  return (
    <CardContent className="space-y-6">
      <SessionSelector 
        sessions={sessions}
        currentSession={currentSession}
        onSessionChange={onSessionChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
      
      <ExcelUpload />
      
      <div className="flex justify-between mb-6">
        <h3 className="text-lg font-medium">
          Manage Teachers ({teachers.length}) - {currentSession}
        </h3>
        
        <AddTeacherDialog 
          availableClasses={availableClasses}
          onAddTeacher={onAddTeacher}
        />
      </div>
      
      <TeachersList 
        teachers={teachers}
        onEdit={onEditTeacher}
        onDelete={onDeleteTeacher}
        onAssignClasses={onAssignClasses}
      />
    </CardContent>
  );
};

export default TeacherManagementContent;
