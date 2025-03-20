
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
import { useTeacherManagement } from '@/hooks/useTeacherManagement';
import { RefreshCw } from 'lucide-react';

const RoleAssignment: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Check if user is super admin, otherwise redirect
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

  // Set up listener for teacher data updates
  useEffect(() => {
    const handleDataUpdate = () => {
      loadTeacherData();
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate);
    };
  }, [loadTeacherData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadTeacherData();
      toast({
        title: "Data refreshed",
        description: "Teacher data has been refreshed from the database"
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
          {/* Excel Upload Component */}
          <ExcelUpload />
          
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-medium">
              Manage Teachers ({teachers.length})
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

      {/* Edit Teacher Dialog */}
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

      {/* Class Assignment Dialog */}
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
