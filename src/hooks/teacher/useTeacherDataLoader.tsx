
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
      
      // Transform to the format needed for the table
      const formattedTeachers = loadedTeachers.map((teacher, index) => {
        // Determine the role based on which email ID is available
        let role: Role = 'presenter';
        let name = 'Unknown';
        let email = '';
        
        if (teacher['Robe Email ID'] && teacher['Robe Email ID'].includes('@')) {
          role = 'robe-in-charge';
          name = teacher['Accompanying Teacher'] || 'Unknown';
          email = teacher['Robe Email ID'];
        } else if (teacher['Folder Email ID'] && teacher['Folder Email ID'].includes('@')) {
          role = 'folder-in-charge';
          name = teacher['Folder in Charge'] || 'Unknown';
          email = teacher['Folder Email ID'];
        }
        
        // For folder-in-charge teachers, ensure we're using the correct name
        if (role === 'folder-in-charge' && teacher['Folder in Charge']) {
          name = teacher['Folder in Charge'];
        }
        
        return {
          id: (index + 1).toString(),
          name: name,
          email: email,
          role: role,
          program: teacher['Programme Name'] || '',
          section: teacher['Class Wise/\nSection Wise'] || '',
          assignedClasses: [teacher['Programme Name'] || ''],
          rawData: teacher, // Keep the original data for reference
          dbId: teacher.id || '' // Store the database ID if available
        };
      });
      
      console.log('Loaded and formatted teachers:', formattedTeachers);
      setTeachers(formattedTeachers);
    } catch (error) {
      console.error('Error loading teachers:', error);
      
      // Fallback to localStorage
      const loadedTeachers = getAllTeachers();
      
      const formattedTeachers = loadedTeachers.map((teacher, index) => {
        // Determine the role based on which email ID is available
        let role: Role = 'presenter';
        let name = 'Unknown';
        let email = '';
        
        if (teacher['Robe Email ID'] && teacher['Robe Email ID'].includes('@')) {
          role = 'robe-in-charge';
          name = teacher['Accompanying Teacher'] || 'Unknown';
          email = teacher['Robe Email ID'];
        } else if (teacher['Folder Email ID'] && teacher['Folder Email ID'].includes('@')) {
          role = 'folder-in-charge';
          name = teacher['Folder in Charge'] || 'Unknown';
          email = teacher['Folder Email ID'];
        }
        
        // Create two entries if both roles are present in the same row
        if (teacher['Robe Email ID'] && teacher['Folder Email ID'] && 
            teacher['Accompanying Teacher'] && teacher['Folder in Charge']) {
          // Just add one for now - the correct one based on role
          return {
            id: (index + 1).toString(),
            name: name,
            email: email,
            role: role,
            program: teacher['Programme Name'] || '',
            section: teacher['Class Wise/\nSection Wise'] || '',
            assignedClasses: [teacher['Programme Name'] || ''],
            rawData: teacher,
          };
        }
        
        return {
          id: (index + 1).toString(),
          name: name,
          email: email,
          role: role,
          program: teacher['Programme Name'] || '',
          section: teacher['Class Wise/\nSection Wise'] || '',
          assignedClasses: [teacher['Programme Name'] || ''],
          rawData: teacher,
        };
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
