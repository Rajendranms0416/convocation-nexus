
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, FilterOption } from '@/types';
import { useToast } from '@/components/ui/use-toast';

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
    section?: string
  ) => Student[];
  getFilterOptions: (field: 'location' | 'school' | 'department' | 'section') => FilterOption[];
}

const StudentContext = createContext<StudentContextType>({
  students: [],
  isLoading: true,
  updateStudentStatus: () => {},
  filterStudents: () => [],
  getFilterOptions: () => [],
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

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch students
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
        setIsLoading(false);
      }, 800);
    };

    fetchStudents();
  }, []);

  // Update student status (robe, folder, presented)
  const updateStudentStatus = (
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const updatedStudent = { ...student, [status]: value };
        
        // Show a toast notification
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
          description: `${student.name}'s ${statusMap[status].toLowerCase()} status has been ${value ? 'confirmed' : 'unconfirmed'}.`,
        });
        
        return updatedStudent;
      }
      return student;
    });
    
    setStudents(updatedStudents);
    localStorage.setItem('convocation_students', JSON.stringify(updatedStudents));
  };

  // Filter students by name, registration number, and other filters
  const filterStudents = (
    query: string, 
    location?: string, 
    school?: string, 
    department?: string, 
    section?: string
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
    
    return filtered;
  };

  // Get unique filter options for a specific field
  const getFilterOptions = (field: 'location' | 'school' | 'department' | 'section'): FilterOption[] => {
    const uniqueValues = Array.from(new Set(students.map(student => student[field])));
    return uniqueValues.map(value => ({ value, label: value }));
  };

  return (
    <StudentContext.Provider value={{
      students,
      isLoading,
      updateStudentStatus,
      filterStudents,
      getFilterOptions,
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
