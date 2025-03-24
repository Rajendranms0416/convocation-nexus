
import { useState, useEffect, useCallback } from 'react';
import { getTeachersBySession } from '@/utils/authHelpers';
import { Role } from '@/types';

/**
 * Hook to load and format teacher data based on selected session
 */
export const useTeacherDataLoader = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<string>("April 22, 2023 - Morning (09:00 AM)");

  const loadTeacherData = useCallback(async (session: string = currentSession) => {
    setIsLoading(true);
    setCurrentSession(session);
    
    try {
      // Load from localStorage for the specific session
      const loadedTeachers = getTeachersBySession(session);
      
      // Array to hold our formatted teachers
      const formattedTeachers: any[] = [];
      
      // Transform to the format needed for the table
      loadedTeachers.forEach((teacher, index) => {
        // Process teacher with Robe Email ID
        if (teacher['Robe Email ID'] && teacher['Robe Email ID'].includes('@')) {
          formattedTeachers.push({
            id: `robe-${index + 1}`,
            name: teacher['Accompanying Teacher'] || 'Unknown',
            email: teacher['Robe Email ID'],
            role: 'robe-in-charge' as Role,
            program: teacher['Programme Name'] || '',
            section: teacher['Class Wise/\nSection Wise'] || '',
            assignedClasses: [teacher['Programme Name'] || ''].filter(Boolean),
            session: session,
            rawData: teacher
          });
        }
        
        // Process teacher with Folder Email ID (as a separate teacher entry)
        if (teacher['Folder Email ID'] && teacher['Folder Email ID'].includes('@')) {
          formattedTeachers.push({
            id: `folder-${index + 1}`,
            name: teacher['Folder in Charge'] || 'Unknown',
            email: teacher['Folder Email ID'],
            role: 'folder-in-charge' as Role,
            program: teacher['Programme Name'] || '',
            section: teacher['Class Wise/\nSection Wise'] || '',
            assignedClasses: [teacher['Programme Name'] || ''].filter(Boolean),
            session: session,
            rawData: teacher
          });
        }
      });
      
      console.log(`Loaded and formatted teachers for session ${session}:`, formattedTeachers);
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession]);

  // Set up initial data loading and update listener
  useEffect(() => {
    loadTeacherData(currentSession);
    
    // Listen for data updates from other components
    const handleDataUpdate = (event: CustomEvent) => {
      // If the event includes a session, load data for that session
      if (event.detail?.session) {
        loadTeacherData(event.detail.session);
      } else {
        loadTeacherData(currentSession);
      }
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    };
  }, [loadTeacherData, currentSession]);

  return {
    teachers,
    setTeachers,
    isLoading,
    currentSession,
    setCurrentSession,
    loadTeacherData,
  };
};
