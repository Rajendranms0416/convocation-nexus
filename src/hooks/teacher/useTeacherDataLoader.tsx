
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase, queryDynamicTable } from '@/integrations/supabase/client';
import { TeachersRow } from '@/integrations/supabase/custom-types';

/**
 * Hook to load teacher data from Supabase
 */
export const useTeacherDataLoader = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentDatabase, setCurrentDatabase] = useState<{
    id: string;
    tableName: string;
    sessionInfo: string;
    uploadDate: string;
    recordCount: number;
  } | null>(null);

  /**
   * Load teacher data from default table or a specific dynamic table
   */
  const loadTeacherData = useCallback(async (tableName?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let data;
      
      if (tableName) {
        // If a specific table is requested, query that
        const { data: dynamicData, error: dynamicError } = await queryDynamicTable(tableName)
          .select('*')
          .order('id', { ascending: true });
        
        if (dynamicError) {
          throw dynamicError;
        }
        
        data = dynamicData;
        
        // Ensure we're using consistent property names
        data = (data as any[]).map(item => ({
          ...item,
          // Add tableName to each record for reference in update/delete operations
          tableName,
        }));
      } else {
        // Default to the teachers table
        const { data: teachersData, error: teachersError } = await supabase
          .from('teachers')
          .select('*')
          .order('id', { ascending: true });
        
        if (teachersError) {
          throw teachersError;
        }
        
        data = teachersData;
      }
      
      setTeachers(data || []);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load teacher data';
      console.error('Error loading teacher data:', error);
      setError(error instanceof Error ? error : new Error(errorMessage));
      
      toast({
        title: 'Error loading teachers',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Load all sessions from file_uploads table
   */
  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('*')
        .order('upload_date', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data.map(item => item.session_info || 'Unknown Session');
    } catch (error) {
      console.error('Error loading sessions:', error);
      
      toast({
        title: 'Error loading sessions',
        description: error instanceof Error ? error.message : 'Failed to load sessions',
        variant: 'destructive',
      });
      
      return [];
    }
  }, [toast]);

  /**
   * Load teacher data by session info
   */
  const loadTeachersBySession = useCallback(async (sessionInfo: string) => {
    try {
      // First find the table name for this session
      const { data: uploadData, error: uploadError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('session_info', sessionInfo)
        .order('upload_date', { ascending: false })
        .limit(1);
      
      if (uploadError) {
        throw uploadError;
      }
      
      if (!uploadData || uploadData.length === 0) {
        throw new Error(`No database found for session: ${sessionInfo}`);
      }
      
      const uploadRecord = uploadData[0];
      
      // Set the current database
      setCurrentDatabase({
        id: String(uploadRecord.id),
        tableName: uploadRecord.table_name,
        sessionInfo: uploadRecord.session_info || '',
        uploadDate: new Date(uploadRecord.upload_date).toLocaleString(),
        recordCount: uploadRecord.record_count || 0
      });
      
      // Now load data from that table
      return await loadTeacherData(uploadRecord.table_name);
    } catch (error) {
      console.error('Error loading teachers by session:', error);
      
      toast({
        title: 'Error loading session data',
        description: error instanceof Error ? error.message : 'Failed to load teacher data for session',
        variant: 'destructive',
      });
      
      return [];
    }
  }, [loadTeacherData, toast]);

  /**
   * Load teacher data by database ID
   */
  const loadTeachersByDatabaseId = useCallback(async (databaseId: string) => {
    try {
      // Find the database record
      const { data: uploadData, error: uploadError } = await supabase
        .from('file_uploads')
        .select('*')
        .eq('id', databaseId)
        .single();
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Set the current database
      setCurrentDatabase({
        id: String(uploadData.id),
        tableName: uploadData.table_name,
        sessionInfo: uploadData.session_info || '',
        uploadDate: new Date(uploadData.upload_date).toLocaleString(),
        recordCount: uploadData.record_count || 0
      });
      
      // Now load data from that table
      return await loadTeacherData(uploadData.table_name);
    } catch (error) {
      console.error('Error loading teachers by database ID:', error);
      
      toast({
        title: 'Error loading database',
        description: error instanceof Error ? error.message : 'Failed to load teacher data from database',
        variant: 'destructive',
      });
      
      return [];
    }
  }, [loadTeacherData, toast]);

  return {
    teachers,
    setTeachers,
    isLoading,
    error,
    currentDatabase,
    loadTeacherData,
    loadSessions,
    loadTeachersBySession,
    loadTeachersByDatabaseId
  };
};
