
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RoleAssignmentCallbacksProps {
  currentSession: string;
  setCurrentSession: (session: string) => void;
  loadTeacherData: (session: string) => Promise<any>; 
}

export const useRoleAssignmentCallbacks = ({
  currentSession,
  setCurrentSession,
  loadTeacherData
}: RoleAssignmentCallbacksProps) => {
  const { toast } = useToast();

  const handleSessionChange = useCallback((session: string) => {
    setCurrentSession(session);
  }, [setCurrentSession]);

  const handleRefresh = useCallback(async () => {
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
    }
  }, [currentSession, loadTeacherData, toast]);

  const handleDataLoaded = useCallback((data: any[], sessionInfo: string) => {
    setCurrentSession(sessionInfo);
    loadTeacherData(sessionInfo);
  }, [setCurrentSession, loadTeacherData]);

  return {
    handleSessionChange,
    handleRefresh,
    handleDataLoaded
  };
};

export default useRoleAssignmentCallbacks;
