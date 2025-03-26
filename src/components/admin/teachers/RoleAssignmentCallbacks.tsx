
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
    console.log('Session changed to:', session);
    setCurrentSession(session);
  }, [setCurrentSession]);

  const handleRefresh = useCallback(async () => {
    console.log('Refreshing data for session:', currentSession);
    try {
      const data = await loadTeacherData(currentSession);
      console.log('Data refreshed:', data);
      
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
    console.log('Data loaded event received with session:', sessionInfo);
    console.log('Data sample:', data.slice(0, 2));
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
