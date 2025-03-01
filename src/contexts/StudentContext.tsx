
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface StudentContextType {
  students: Student[];
  isLoading: boolean;
  updateStudentStatus: (
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance', 
    value: boolean
  ) => void;
  filterStudents: (query: string) => Student[];
}

const StudentContext = createContext<StudentContextType>({
  students: [],
  isLoading: true,
  updateStudentStatus: () => {},
  filterStudents: () => [],
});

// Mock student data for demonstration
const MOCK_STUDENTS: Student[] = Array(50).fill(null).map((_, index) => ({
  id: `student-${index + 1}`,
  name: `Student ${index + 1}`,
  registrationNumber: `2023${(1000 + index).toString().padStart(4, '0')}`,
  program: ['Computer Science', 'Engineering', 'Business Administration', 'Medicine', 'Law'][Math.floor(Math.random() * 5)],
  hasTakenRobe: Math.random() > 0.5,
  hasTakenFolder: Math.random() > 0.5,
  hasBeenPresented: Math.random() > 0.5,
  attendance: Math.random() > 0.3,
}));

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
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance', 
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

  // Filter students by name or registration number
  const filterStudents = (query: string): Student[] => {
    if (!query.trim()) return students;
    
    const lowercaseQuery = query.toLowerCase();
    return students.filter(student => 
      student.name.toLowerCase().includes(lowercaseQuery) || 
      student.registrationNumber.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <StudentContext.Provider value={{
      students,
      isLoading,
      updateStudentStatus,
      filterStudents,
    }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
