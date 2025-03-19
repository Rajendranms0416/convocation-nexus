
import { useState, useEffect } from 'react';
import { Role } from '@/types';
import { getAllTeachers } from '@/utils/authHelpers';
import { excelService } from '@/services/excel';

/**
 * Hook to manage teacher state
 */
export const useTeacherState = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClassAssignDialogOpen, setIsClassAssignDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState<Role>('presenter');
  const [emailType, setEmailType] = useState<'robe' | 'folder'>('robe');
  
  // Class assignment states
  const [availableClasses, setAvailableClasses] = useState([
    'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
    'MCA 1st Year', 'MCA 2nd Year', 
    'BCom 1st Year', 'BCom 2nd Year', 'BCom 3rd Year',
    'MBA 1st Year', 'MBA 2nd Year'
  ]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Load teacher data
  useEffect(() => {
    const loadTeacherData = async () => {
      setIsLoading(true);
      try {
        // Try to load from database first
        const loadedTeachers = await excelService.getTeacherData();
        
        // Transform to the format needed for the table
        const formattedTeachers = loadedTeachers.map((teacher, index) => ({
          id: (index + 1).toString(),
          name: teacher['Accompanying Teacher'] || teacher['Folder in Charge'] || 'Unknown',
          email: teacher['Robe Email ID'] || teacher['Folder Email ID'] || '',
          role: teacher['Robe Email ID'] ? 'robe-in-charge' : 'folder-in-charge',
          program: teacher['Programme Name'] || '',
          section: teacher['Class Wise/\nSection Wise'] || '',
          assignedClasses: [teacher['Programme Name'] || ''],
          rawData: teacher // Keep the original data for reference
        }));
        
        setTeachers(formattedTeachers);
      } catch (error) {
        console.error('Error loading teachers:', error);
        
        // Fallback to localStorage
        const loadedTeachers = getAllTeachers();
        
        const formattedTeachers = loadedTeachers.map((teacher, index) => ({
          id: (index + 1).toString(),
          name: teacher['Accompanying Teacher'] || teacher['Folder in Charge'] || 'Unknown',
          email: teacher['Robe Email ID'] || teacher['Folder Email ID'] || '',
          role: teacher['Robe Email ID'] ? 'robe-in-charge' : 'folder-in-charge',
          program: teacher['Programme Name'] || '',
          section: teacher['Class Wise/\nSection Wise'] || '',
          assignedClasses: [teacher['Programme Name'] || ''],
          rawData: teacher
        }));
        
        setTeachers(formattedTeachers);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTeacherData();
  }, []);

  return {
    // Teacher state
    teachers,
    setTeachers,
    isLoading,
    
    // Dialog states
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isClassAssignDialogOpen,
    setIsClassAssignDialogOpen,
    
    // Current teacher
    currentTeacher,
    setCurrentTeacher,
    
    // Form states
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail,
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    
    // Class states
    availableClasses,
    setAvailableClasses,
    selectedClasses,
    setSelectedClasses,
  };
};
