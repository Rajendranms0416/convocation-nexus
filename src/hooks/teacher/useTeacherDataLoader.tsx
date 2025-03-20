
import { useState, useEffect, useCallback } from 'react';
import { getAllTeachers } from '@/utils/authHelpers';
import { excelService } from '@/services/excel';
import { Role } from '@/types';

/**
 * Hook to load and format teacher data
 */
export const useTeacherDataLoader = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTeacherData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Try to load from database first
      const loadedTeachers = await excelService.getTeacherData();
      
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
            rawData: teacher,
            dbId: teacher.id || ''
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
            rawData: teacher,
            dbId: teacher.id || ''
          });
        }
      });
      
      console.log('Loaded and formatted teachers:', formattedTeachers);
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      
      // Fallback to localStorage
      const loadedTeachers = getAllTeachers();
      
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
            rawData: teacher
          });
        }
      });
      
      setTeachers(formattedTeachers);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up initial data loading and update listener
  useEffect(() => {
    loadTeacherData();
    
    // Listen for data updates from other components
    const handleDataUpdate = () => {
      loadTeacherData();
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate);
    };
  }, [loadTeacherData]);

  return {
    teachers,
    setTeachers,
    isLoading,
    loadTeacherData,
  };
};
