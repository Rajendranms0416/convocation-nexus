
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { getAllSessions } from '@/utils/authHelpers';
import RoleAssignmentHeader from '@/components/admin/teachers/RoleAssignmentHeader';
import TeacherManagementContent from '@/components/admin/teachers/TeacherManagementContent';
import DialogsContainer from '@/components/admin/teachers/DialogsContainer';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseInfo {
  id: string;
  tableName: string;
  session: string;
  uploadDate: string;
  recordCount: number;
}

const RoleAssignment: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSession, setCurrentSession] = useState<string>("April 22, 2023 - Morning (09:00 AM)");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);
  const [currentDatabase, setCurrentDatabase] = useState<DatabaseInfo | null>(null);
  
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

  useEffect(() => {
    console.log("RoleAssignment component mounted, checking auth");
    console.log("Auth state:", { isLoading, isAuthenticated, user });
    
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to login");
        toast({
          title: "Authentication required",
          description: "Please login to access this page",
          variant: "destructive"
        });
        navigate('/login');
        return;
      }
      
      if (user && user.role !== 'super-admin') {
        console.log("User doesn't have super-admin role, redirecting to dashboard");
        toast({
          title: "Access Denied",
          description: "Only super admins can access this page",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    }
  }, [isLoading, isAuthenticated, user, navigate, toast]);

  useEffect(() => {
    const loadSessions = () => {
      const sessions = getAllSessions();
      setAvailableSessions(sessions);
      
      if (sessions.length > 0 && !sessions.includes(currentSession)) {
        setCurrentSession(sessions[0]);
      }
    };
    
    loadSessions();
    
    const handleDataUpdate = (event: CustomEvent) => {
      loadSessions();
      
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
  }, [currentSession, currentDatabase, loadTeacherData, toast]);

  const handleSessionChange = (session: string) => {
    setCurrentSession(session);
    setCurrentDatabase(null);
  };

  const handleDatabaseChange = (database: DatabaseInfo) => {
    setCurrentDatabase(database);
    setCurrentSession(database.session);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTeacherData(currentSession);
      
      toast({
        title: "Data refreshed",
        description: `Teacher data has been refreshed for ${currentDatabase ? 'database: ' + currentDatabase.session : 'session: ' + currentSession}`
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

  const handleDataLoaded = (data: any[], sessionInfo: string, tableId?: string) => {
    setCurrentSession(sessionInfo);
    
    if (tableId) {
      const getDbInfo = async () => {
        try {
          const { data, error } = await supabase
            .from('file_uploads')
            .select('id, table_name, session_info, upload_date, record_count')
            .eq('id', parseInt(tableId))
            .single();
            
          if (error) throw error;
          
          if (data) {
            const dbInfo: DatabaseInfo = {
              id: String(data.id),
              tableName: data.table_name,
              session: data.session_info || 'Unknown Session',
              uploadDate: new Date(data.upload_date).toLocaleString(),
              recordCount: data.record_count || 0
            };
            
            setCurrentDatabase(dbInfo);
            loadTeacherData(sessionInfo);
          }
        } catch (error) {
          console.error('Error getting database info:', error);
          loadTeacherData(sessionInfo);
        }
      };
      
      getDbInfo();
    } else {
      loadTeacherData(sessionInfo);
    }
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

  if (user?.role !== 'super-admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
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
          onDatabaseChange={handleDatabaseChange}
          currentDatabaseId={currentDatabase?.id}
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
