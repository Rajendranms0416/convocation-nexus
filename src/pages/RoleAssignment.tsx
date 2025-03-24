
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ExcelUpload from '@/components/admin/ExcelUpload';
import TeachersList from '@/components/admin/teachers/TeachersList';
import AddTeacherDialog from '@/components/admin/teachers/AddTeacherDialog';
import EditTeacherDialog from '@/components/admin/teachers/EditTeacherDialog';
import ClassAssignmentDialog from '@/components/admin/teachers/ClassAssignmentDialog';
import SessionSelector from '@/components/admin/teachers/SessionSelector';
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { getAllSessions } from '@/utils/authHelpers';
import { RefreshCw } from 'lucide-react';

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
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Teacher Role Management</CardTitle>
              <CardDescription>
                Assign roles and classes to teachers for the convocation
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="flex items-center"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              
              <Button onClick={() => navigate(-1)} variant="outline">
                Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionSelector 
            sessions={availableSessions}
            currentSession={currentSession}
            onSessionChange={handleSessionChange}
          />
          
          <ExcelUpload />
          
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-medium">
              Manage Teachers ({teachers.length}) - {currentSession}
            </h3>
            
            <AddTeacherDialog 
              availableClasses={availableClasses}
              onAddTeacher={handleAddTeacher}
            />
          </div>
          
          <TeachersList 
            teachers={teachers}
            onEdit={handleEditTeacher}
            onDelete={handleDeleteTeacher}
            onAssignClasses={handleAssignClasses}
          />
        </CardContent>
      </Card>

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
        onUpdate={handleUpdateTeacher}
        setTeacherRole={setNewTeacherRole}
      />

      <ClassAssignmentDialog 
        isOpen={isClassAssignDialogOpen}
        onClose={() => setIsClassAssignDialogOpen(false)}
        teacher={currentTeacher}
        availableClasses={availableClasses}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        onSave={saveClassAssignments}
      />
    </div>
  );
};

export default RoleAssignment;
