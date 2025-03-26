
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { getAllSessions } from '@/utils/authHelpers';
import RoleAssignmentHeader from '@/components/admin/teachers/RoleAssignmentHeader';
import TeacherManagementContent from '@/components/admin/teachers/TeacherManagementContent';
import DialogsContainer from '@/components/admin/teachers/DialogsContainer';

const RoleAssignment: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>("April 22, 2023 - Morning (09:00 AM)");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  
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
  } = useTeacherManagement();

  // Effect to load available sessions
  useEffect(() => {
    const loadSessions = () => {
      const sessions = getAllSessions();
      setAvailableSessions(sessions);
      
      if (sessions.length > 0 && !sessions.includes(currentSession)) {
        setCurrentSession(sessions[0]);
      }
    };
    
    loadSessions();
    
    // Listen for data updates from other components
    const handleDataUpdate = (event: CustomEvent) => {
      loadSessions();
      
      // Update current session if provided in the event
      if (event.detail?.session) {
        setCurrentSession(event.detail.session);
      }
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    };
  }, [currentSession]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role !== 'super-admin') {
        toast({
          title: "Access Denied",
          description: "Only super admins can access this page",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    } else if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate, toast]);

  // Load teacher data for the current session
  useEffect(() => {
    const loadSessionData = async () => {
      setIsRefreshing(true);
      try {
        await loadTeacherData(currentSession);
      } catch (error) {
        console.error("Error loading session data:", error);
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    };
    
    loadSessionData();
  }, [currentSession, loadTeacherData, toast]);

  const handleSessionChange = (session: string) => {
    setCurrentSession(session);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTeacherData(currentSession);
      
      toast({
        title: "Data refreshed",
        description: `Teacher data has been refreshed for session: ${currentSession}`
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error refreshing data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDataLoaded = (data: any[], sessionInfo: string) => {
    // Set the current session when data is loaded
    setCurrentSession(sessionInfo);
    
    // Trigger data refresh
    loadTeacherData(sessionInfo);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
          <div className="h-4 w-48 rounded bg-convocation-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <RoleAssignmentHeader 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <TeacherManagementContent
          sessions={availableSessions}
          currentSession={currentSession}
          onSessionChange={handleSessionChange}
          isRefreshing={isRefreshing}
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
  );
};

export default RoleAssignment;
