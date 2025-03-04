
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, FilterOption, AttendanceStage, StudentFilters, PaginatedData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { studentApi } from '@/services/api';

interface StudentContextType {
  students: Student[];
  totalStudents: number;
  totalPages: number;
  isLoading: boolean;
  updateStudentStatus: (
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ) => void;
  filterOptions: {
    location: FilterOption[];
    school: FilterOption[];
    department: FilterOption[];
    section: FilterOption[];
  } | null;
  lastSyncTime: Date | null;
  syncData: () => Promise<void>;
  isSyncing: boolean;
  needsSync: boolean;
  applyFilters: (filters: StudentFilters) => void;
}

const StudentContext = createContext<StudentContextType>({
  students: [],
  totalStudents: 0,
  totalPages: 0,
  isLoading: true,
  updateStudentStatus: () => {},
  filterOptions: null,
  lastSyncTime: null,
  syncData: async () => {},
  isSyncing: false,
  needsSync: false,
  applyFilters: () => {},
});

// Mock student locations, schools, departments, and sections
const LOCATIONS = ['Main Campus', 'East Campus', 'West Campus', 'South Campus', 'North Campus'];
const SCHOOLS = ['Engineering', 'Business', 'Arts & Sciences', 'Medicine', 'Law'];
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Business Administration', 'Finance', 'Marketing', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Medicine', 'Law'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Mock student data for demonstration (only used if no data exists in localStorage)
const MOCK_STUDENTS: Student[] = Array(50).fill(null).map((_, index) => {
  const department = DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)];
  let school = '';
  
  if (['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering'].includes(department)) {
    school = 'Engineering';
  } else if (['Business Administration', 'Finance', 'Marketing'].includes(department)) {
    school = 'Business';
  } else if (['Biology', 'Chemistry', 'Physics', 'Mathematics'].includes(department)) {
    school = 'Arts & Sciences';
  } else if (department === 'Medicine') {
    school = 'Medicine';
  } else if (department === 'Law') {
    school = 'Law';
  }
  
  return {
    id: `student-${index + 1}`,
    name: `Student ${index + 1}`,
    registrationNumber: `2023${(1000 + index).toString().padStart(4, '0')}`,
    program: school,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    school: school,
    department: department,
    section: SECTIONS[Math.floor(Math.random() * SECTIONS.length)],
    hasTakenRobe: Math.random() > 0.5,
    hasTakenFolder: Math.random() > 0.5,
    hasBeenPresented: Math.random() > 0.5,
    attendance: Math.random() > 0.3,
    robeSlot1: Math.random() > 0.5,
    robeSlot2: Math.random() > 0.5,
  };
});

// Define the time windows for each role's operations
const TIME_WINDOWS = {
  'robe-in-charge': {
    start: new Date('2023-06-01T08:00:00'),
    end: new Date('2023-06-02T17:00:00')
  },
  'folder-in-charge': {
    start: new Date('2023-06-03T08:00:00'),
    end: new Date('2023-06-04T17:00:00')
  },
  'presenter': {
    start: new Date('2023-06-05T08:00:00'),
    end: new Date('2023-06-06T17:00:00')
  }
};

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Students state now includes pagination data
  const [studentsData, setStudentsData] = useState<PaginatedData<Student>>({
    data: [],
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [filterOptions, setFilterOptions] = useState<{
    location: FilterOption[];
    school: FilterOption[];
    department: FilterOption[];
    section: FilterOption[];
  } | null>(null);
  
  // Current filters
  const [currentFilters, setCurrentFilters] = useState<StudentFilters>({
    page: 1,
    pageSize: 20
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Apply filters and fetch students based on current filters
  const applyFilters = useCallback((filters: StudentFilters) => {
    setCurrentFilters(filters);
  }, []);

  // Fetch filter options
  const fetchFilterOptions = useCallback(async () => {
    try {
      const [locationOptions, schoolOptions, departmentOptions, sectionOptions] = await Promise.all([
        studentApi.getFilterOptions('location'),
        studentApi.getFilterOptions('school'),
        studentApi.getFilterOptions('department'),
        studentApi.getFilterOptions('section')
      ]);
      
      setFilterOptions({
        location: locationOptions,
        school: schoolOptions,
        department: departmentOptions,
        section: sectionOptions
      });
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  }, []);

  // Initial data loading - only runs once
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        // Check if we need to initialize with mock data
        const storedStudents = localStorage.getItem('convocation_students');
        if (!storedStudents) {
          // Initialize with mock data
          localStorage.setItem('convocation_students', JSON.stringify(MOCK_STUDENTS));
        }
        
        // Get last sync time
        const storedSyncTime = localStorage.getItem('lastSyncTime');
        if (storedSyncTime) {
          setLastSyncTime(new Date(storedSyncTime));
        }
        
        // Fetch filter options
        await fetchFilterOptions();
        
        // Initial fetch with default filters
        const result = await studentApi.getStudents(currentFilters);
        setStudentsData(result);
      } catch (error) {
        console.error("Error initializing student data:", error);
        toast({
          variant: "destructive",
          title: "Loading error",
          description: "Could not load student data. Please try refreshing the page.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [toast, fetchFilterOptions]);

  // Fetch students when filters change
  useEffect(() => {
    const fetchStudents = async () => {
      if (!currentFilters) return;
      
      setIsLoading(true);
      try {
        const result = await studentApi.getStudents(currentFilters);
        setStudentsData(result);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStudents();
  }, [currentFilters]);

  // Sync data with "server" (in this demo, we're just simulating a network request)
  const syncData = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    
    try {
      await studentApi.syncData();
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      setNeedsSync(false);
      
      toast({
        title: "Sync completed",
        description: "All changes have been saved to the server.",
      });
      
      // Refresh data after sync
      const result = await studentApi.getStudents(currentFilters);
      setStudentsData(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Changes saved locally. Will retry when connection is available.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, toast, currentFilters]);

  // Auto-sync when online
  useEffect(() => {
    const handleOnline = () => {
      if (needsSync) {
        syncData();
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [needsSync, syncData]);

  // Check if the current user has permission to edit based on role and time window
  const hasEditPermission = useCallback((status: string): boolean => {
    if (!user) return false;
    
    // Super admin can always edit
    if (user.role === 'super-admin') return true;
    
    // For other roles, check if they have permission for this status type
    const now = new Date();
    
    // Map status types to roles
    const roleForStatus = {
      'hasTakenRobe': 'robe-in-charge',
      'robeSlot1': 'robe-in-charge',
      'robeSlot2': 'robe-in-charge',
      'hasTakenFolder': 'folder-in-charge',
      'hasBeenPresented': 'presenter',
      'attendance': 'super-admin' // Only super admin can edit general attendance
    };
    
    // Check if user's role matches the required role for this status
    if (user.role !== roleForStatus[status as keyof typeof roleForStatus]) {
      return false;
    }
    
    // Check if the current time is within the allowed window
    // For demo purposes, we're using fixed dates - in a real app, you'd use dynamic dates
    const timeWindow = TIME_WINDOWS[user.role as keyof typeof TIME_WINDOWS];
    
    // Skip time check for demo purposes - uncomment for real implementation
    // if (!timeWindow || now < timeWindow.start || now > timeWindow.end) {
    //   return false;
    // }
    
    return true;
  }, [user]);

  // Update student status function
  const updateStudentStatus = useCallback(async (
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ) => {
    // Check if the user has permission to edit
    if (!hasEditPermission(status)) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You don't have permission to update this status at this time.",
      });
      return;
    }
    
    try {
      // Update via API
      const updatedStudent = await studentApi.updateStudentStatus(studentId, status, value);
      
      // Update local state
      setStudentsData(prev => ({
        ...prev,
        data: prev.data.map(student => 
          student.id === studentId ? updatedStudent : student
        )
      }));
      
      // Mark that we need to sync
      setNeedsSync(true);
      
      // Show toast notification
      const statusMap = {
        hasTakenRobe: 'Robe collection',
        hasTakenFolder: 'Folder collection',
        hasBeenPresented: 'Presentation',
        attendance: 'Attendance',
        robeSlot1: 'Robe Slot 1',
        robeSlot2: 'Robe Slot 2',
      };
      
      toast({
        title: `${statusMap[status]} updated`,
        description: `${updatedStudent.name}'s ${statusMap[status].toLowerCase()} status has been ${value ? 'confirmed' : 'unconfirmed'}.`,
      });
      
      // Sync if online
      if (navigator.onLine) {
        syncData();
      } else {
        toast({
          variant: "destructive",
          title: "No internet connection",
          description: "Changes saved locally and will sync when you're back online.",
        });
      }
    } catch (error) {
      console.error("Error updating student status:", error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: "Failed to update student status. Please try again.",
      });
    }
  }, [hasEditPermission, syncData, toast]);

  return (
    <StudentContext.Provider value={{
      students: studentsData.data,
      totalStudents: studentsData.total,
      totalPages: studentsData.totalPages,
      isLoading,
      updateStudentStatus,
      filterOptions,
      lastSyncTime,
      syncData,
      isSyncing,
      needsSync,
      applyFilters
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
