
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTeachersBySession } from '@/utils/authHelpers';

/**
 * A hook to load teacher data from localStorage
 */
export const useTeacherDataLoader = (setTeachers: React.Dispatch<React.SetStateAction<any[]>>) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load teacher data for a specific session from localStorage
   */
  const loadTeacherData = async (sessionInfo: string) => {
    console.log('Loading teacher data for session:', sessionInfo);
    setLoading(true);
    setError(null);

    try {
      // Load data from localStorage by session name
      const teacherData = getTeachersBySession(sessionInfo);
      console.log('Teacher data retrieved from localStorage:', teacherData);
      
      if (teacherData && teacherData.length > 0) {
        // Transform the data to match our teacher schema if needed
        const transformedData = teacherData.map(item => ({
          ...item,
          // Standardize names for unified handling in the UI
          id: item.id || Math.random().toString(36).substr(2, 9),
          name: item.Programme_Name || item['Programme Name'] || 'Unnamed Program',
          email: item.Robe_Email_ID || item['Robe Email ID'] || 
                 item.Folder_Email_ID || item['Folder Email ID'] || '',
          role: item.Accompanying_Teacher ? 'robe-in-charge' : 
                item.Folder_in_Charge ? 'folder-in-charge' : 'unknown'
        }));
        
        console.log('Transformed data:', transformedData.slice(0, 2));
        setTeachers(transformedData);
        setLoading(false);
        
        return transformedData;
      } else {
        // If no data found for this session, set empty array
        console.log('No data found for session:', sessionInfo);
        setTeachers([]);
        setLoading(false);
        
        useToast().toast({
          title: 'No data for this session',
          description: `No teacher data found for session: ${sessionInfo}. Upload a file to add data.`,
          variant: 'default',
        });
        
        return [];
      }
    } catch (err) {
      console.error('Error loading teacher data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error loading teacher data'));
      
      useToast().toast({
        title: 'Failed to load teacher data',
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
    loadTeacherData
  };
};
