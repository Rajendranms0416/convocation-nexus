import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * A hook to load teacher data from different sources:
 * - Static teacher data from the "teachers" table
 * - Dynamic data from uploaded files in dynamically created tables
 */
export const useTeacherDataLoader = (setTeachers: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load teacher data for a specific session
   */
  const loadTeacherData = async (sessionInfo: string) => {
    setLoading(true);
    setError(null);

    try {
      // First, check if there's a dynamic table for this session
      const { data: fileUploads, error: fileError } = await supabase
        .from('file_uploads')
        .select('id, table_name')
        .eq('session_info', sessionInfo)
        .order('upload_date', { ascending: false })
        .limit(1);

      if (fileError) {
        throw fileError;
      }

      // If we found a dynamic table for this session, load from there
      if (fileUploads && fileUploads.length > 0) {
        const { table_name: tableName, id: tableId } = fileUploads[0];
        return await loadDynamicTeacherData(tableName, tableId);
      }

      // Otherwise, load from the static teachers table
      return await loadStaticTeacherData();
    } catch (err) {
      console.error('Error loading teacher data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading teacher data'));
      
      toast({
        title: 'Failed to load teacher data',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      setTeachers([]);
      setLoading(false);
      return [];
    }
  };

  /**
   * Load data from a dynamically created table (from file uploads)
   */
  const loadDynamicTeacherData = async (tableName: string, tableId: string) => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('Programme_Name', { ascending: true });

      if (error) {
        throw error;
      }

      // Check if data structure matches expected format
      if (data && data.length > 0) {
        // Transform the data to match our teacher schema
        const transformedData = data.map(item => ({
          ...item,
          // Make sure we have a unique identifier
          tableId: tableId,
          // Standardize names for unified handling in the UI
          name: item.Programme_Name || 'Unnamed Program',
          email: item.Robe_Email_ID || item.Folder_Email_ID || '',
          role: item.Accompanying_Teacher ? 'accompanying' : 
                item.Folder_in_Charge ? 'folder' : 'unknown'
        }));
        
        setTeachers(transformedData);
        setLoading(false);
        
        return transformedData;
      } else {
        setTeachers([]);
        setLoading(false);
        return [];
      }
    } catch (err) {
      console.error('Error loading dynamic teacher data:', err);
      throw err;
    }
  };

  /**
   * Load data from the static "teachers" table
   */
  const loadStaticTeacherData = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('"Programme Name"', { ascending: true });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Transform the data to match our teacher schema
        const transformedData = data.map(item => ({
          ...item,
          // Standardize names for unified handling in the UI
          name: item['Programme Name'] || 'Unnamed Program',
          email: item['Robe Email ID'] || item['Folder Email ID'] || '',
          role: item['Robe in Charge'] ? 'robe' : 
                item['Folder in Charge'] ? 'folder' : 'unknown'
        }));
        
        setTeachers(transformedData);
        setLoading(false);
        
        return transformedData;
      } else {
        setTeachers([]);
        setLoading(false);
        return [];
      }
    } catch (err) {
      console.error('Error loading static teacher data:', err);
      throw err;
    }
  };

  /**
   * Load teacher data from a specific database by ID
   */
  const loadTeacherDataFromDatabase = async (databaseId: string) => {
    setLoading(true);
    setError(null);

    try {
      // First, get the database info
      const { data: fileUpload, error: fileError } = await supabase
        .from('file_uploads')
        .select('id, table_name, session_info')
        .eq('id', parseInt(databaseId, 10))  // Use parseInt with base 10
        .single();

      if (fileError) {
        throw fileError;
      }

      if (!fileUpload) {
        throw new Error(`Database with ID ${databaseId} not found`);
      }

      // Now load the data from this table
      const result = await loadDynamicTeacherData(fileUpload.table_name, databaseId);
      
      // Emit a custom event so other components can update
      const customEvent = new CustomEvent('teacherDataUpdated', {
        detail: { 
          databaseId,
          session: fileUpload.session_info
        }
      });
      window.dispatchEvent(customEvent);
      
      return result;
    } catch (err) {
      console.error('Error loading teacher data from database:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading teacher data'));
      
      toast({
        title: 'Failed to load teacher data from database',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      setTeachers([]);
      setLoading(false);
      return [];
    }
  };

  return {
    loading,
    error,
    loadTeacherData,
    loadTeacherDataFromDatabase
  };
};
