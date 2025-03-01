
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, FilterOption, AttendanceStage } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface StudentContextType {
  students: Student[];
  isLoading: boolean;
  updateStudentStatus: (
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ) => void;
  filterStudents: (
    query: string, 
    location?: string, 
    school?: string, 
    department?: string, 
    section?: string,
    attendanceStage?: AttendanceStage
  ) => Student[];
  getFilterOptions: (field: 'location' | 'school' | 'department' | 'section') => FilterOption[];
  lastSyncTime: Date | null;
  syncData: () => Promise<void>;
  isSyncing: boolean;
  needsSync: boolean;
}

const StudentContext = createContext<StudentContextType>({
  students: [],
  isLoading: true,
  updateStudentStatus: () => {},
  filterStudents: () => [],
  getFilterOptions: () => [],
  lastSyncTime: null,
  syncData: async () => {},
  isSyncing: false,
  needsSync: false,
});

// Mock student locations, schools, departments, and sections
const LOCATIONS = ['Main Campus', 'East Campus', 'West Campus', 'South Campus', 'North Campus'];
const SCHOOLS = ['Engineering', 'Business', 'Arts & Sciences', 'Medicine', 'Law'];
const DEPARTMENTS = ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Business Administration', 'Finance', 'Marketing', 'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Medicine', 'Law'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

// Mock student data for demonstration
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

// Auto-submit timeout in milliseconds (5 minutes)
const AUTO_SUBMIT_TIMEOUT = 5 * 60 * 1000;

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{
    studentId: string;
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2';
    value: boolean;
    timeout: ReturnType<typeof setTimeout> | null;
  }[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data from localStorage initially
  useEffect(() => {
    const fetchStudents = () => {
      setTimeout(() => {
        // Check if students are already in localStorage
        const savedStudents = localStorage.getItem('convocation_students');
        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        } else {
          setStudents(MOCK_STUDENTS);
          localStorage.setItem('convocation_students', JSON.stringify(MOCK_STUDENTS));
        }
        
        // Get last sync time
        const storedSyncTime = localStorage.getItem('lastSyncTime');
        if (storedSyncTime) {
          setLastSyncTime(new Date(storedSyncTime));
        }
        
        setIsLoading(false);
      }, 800);
    };

    fetchStudents();
  }, []);

  // Sync data with "server" (in this demo, we're just simulating a network request)
  const syncData = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return;
    
    setIsSyncing(true);
    
    try {
      // In a real app, this would be an API call to your backend
      // For now, we'll simulate a network request with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      setNeedsSync(false);
      
      toast({
        title: "Sync completed",
        description: "All changes have been saved to the server.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Changes saved locally. Will retry when connection is available.",
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, toast]);

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

  // Process pending changes
  const processPendingChange = useCallback((
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ) => {
    // Update students state
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        return { ...student, [status]: value };
      }
      return student;
    });
    
    setStudents(updatedStudents);
    
    // Save to localStorage
    localStorage.setItem('convocation_students', JSON.stringify(updatedStudents));
    
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
    
    const student = students.find(s => s.id === studentId);
    
    if (student) {
      toast({
        title: `${statusMap[status]} updated`,
        description: `${student.name}'s ${statusMap[status].toLowerCase()} status has been ${value ? 'confirmed' : 'unconfirmed'}.`,
      });
    }
    
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
  }, [students, syncData, toast]);

  // Update student status with auto-submit functionality
  const updateStudentStatus = useCallback((
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
    
    // Find and clear any existing timeout for this student+status
    const existingPendingIndex = pendingChanges.findIndex(
      change => change.studentId === studentId && change.status === status
    );
    
    if (existingPendingIndex !== -1) {
      const existingTimeout = pendingChanges[existingPendingIndex].timeout;
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
      
      // Remove the existing pending change
      const newPendingChanges = [...pendingChanges];
      newPendingChanges.splice(existingPendingIndex, 1);
      setPendingChanges(newPendingChanges);
    }
    
    // Set a timeout for auto-submit
    const timeout = setTimeout(() => {
      processPendingChange(studentId, status, value);
      
      // Remove this pending change
      setPendingChanges(prev => 
        prev.filter(change => 
          !(change.studentId === studentId && change.status === status)
        )
      );
      
      toast({
        title: "Auto-submitted",
        description: "Your changes have been automatically submitted after the timeout period.",
      });
    }, AUTO_SUBMIT_TIMEOUT);
    
    // Add to pending changes
    setPendingChanges(prev => [
      ...prev.filter(change => 
        !(change.studentId === studentId && change.status === status)
      ),
      { studentId, status, value, timeout }
    ]);
    
    // Process the change immediately for now
    // In a real implementation, you might want to wait for the auto-submit
    // or provide a way for users to manually submit their changes
    processPendingChange(studentId, status, value);
  }, [hasEditPermission, pendingChanges, processPendingChange, toast]);

  // Filter students by name, registration number, and other filters
  const filterStudents = useCallback((
    query: string, 
    location?: string, 
    school?: string, 
    department?: string, 
    section?: string,
    attendanceStage?: AttendanceStage
  ): Student[] => {
    let filtered = students;
    
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(student => 
        student.name.toLowerCase().includes(lowercaseQuery) || 
        student.registrationNumber.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    if (location) {
      filtered = filtered.filter(student => student.location === location);
    }
    
    if (school) {
      filtered = filtered.filter(student => student.school === school);
    }
    
    if (department) {
      filtered = filtered.filter(student => student.department === department);
    }
    
    if (section) {
      filtered = filtered.filter(student => student.section === section);
    }
    
    // Apply attendance stage filtering
    if (attendanceStage) {
      switch (attendanceStage) {
        case 'robeSlot1':
          // Show all students for the first robe slot
          break;
        case 'robeSlot1Completed':
          // For the second robe slot, only show students who completed the first slot
          filtered = filtered.filter(student => student.robeSlot1 === true);
          break;
        case 'bothRobeSlotsCompleted':
          // For folder-in-charge, only show students who completed both robe slots
          filtered = filtered.filter(student => student.robeSlot1 === true && student.robeSlot2 === true);
          break;
        case 'folderCompleted':
          // For presenter, only show students who have completed all previous steps
          filtered = filtered.filter(student => 
            student.robeSlot1 === true && 
            student.robeSlot2 === true && 
            student.hasTakenFolder === true
          );
          break;
        case 'all':
        default:
          // Show all students
          break;
      }
    }
    
    return filtered;
  }, [students]);

  // Get unique filter options for a specific field
  const getFilterOptions = useCallback((field: 'location' | 'school' | 'department' | 'section'): FilterOption[] => {
    const uniqueValues = Array.from(new Set(students.map(student => student[field])));
    return uniqueValues.map(value => ({ value, label: value }));
  }, [students]);

  return (
    <StudentContext.Provider value={{
      students,
      isLoading,
      updateStudentStatus,
      filterStudents,
      getFilterOptions,
      lastSyncTime,
      syncData,
      isSyncing,
      needsSync
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
