
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseInfo } from './SessionDataLoader';

interface RoleAssignmentCallbacksProps {
  currentSession: string;
  setCurrentSession: (session: string) => void;
  setCurrentDatabase: (database: DatabaseInfo | null) => void;
  loadTeacherData: (session: string) => Promise<void>;
}

export const useRoleAssignmentCallbacks = ({
  currentSession,
  setCurrentSession,
  setCurrentDatabase,
  loadTeacherData
}: RoleAssignmentCallbacksProps) => {
  const { toast } = useToast();

  const handleSessionChange = useCallback((session: string) => {
    setCurrentSession(session);
    setCurrentDatabase(null);
  }, [setCurrentSession, setCurrentDatabase]);

  const handleDatabaseChange = useCallback((database: DatabaseInfo) => {
    setCurrentDatabase(database);
    setCurrentSession(database.session);
  }, [setCurrentDatabase, setCurrentSession]);

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

  const handleDataLoaded = useCallback((data: any[], sessionInfo: string, tableId?: string) => {
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
  }, [setCurrentSession, setCurrentDatabase, loadTeacherData]);

  return {
    handleSessionChange,
    handleDatabaseChange,
    handleRefresh,
    handleDataLoaded
  };
};

export default useRoleAssignmentCallbacks;
