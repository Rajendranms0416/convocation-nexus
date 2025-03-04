
import { Student, FilterOption, AttendanceStage } from '@/types';

// Base API URL - replace with your actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

// Default pagination values
const DEFAULT_PAGE_SIZE = 50;

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface StudentFilters {
  query?: string;
  location?: string;
  school?: string;
  department?: string;
  section?: string;
  attendanceStage?: AttendanceStage;
  page?: number;
  pageSize?: number;
}

// For demo purposes, this simulates API calls with the mock data
// In production, replace with actual fetch calls to your backend
export const studentApi = {
  async getStudents(filters: StudentFilters = {}): Promise<PaginatedResponse<Student>> {
    try {
      // In a real implementation, this would be a fetch call to your API:
      // const response = await fetch(`${API_BASE_URL}/students?${new URLSearchParams(filters)}`)
      // return await response.json()
      
      // For demo, we're simulating the API call with localStorage
      const storedStudents = localStorage.getItem('convocation_students');
      let students: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
      
      // Apply filters
      if (filters.query) {
        const query = filters.query.toLowerCase();
        students = students.filter(student => 
          student.name.toLowerCase().includes(query) || 
          student.registrationNumber.toLowerCase().includes(query)
        );
      }
      
      if (filters.location) {
        students = students.filter(student => student.location === filters.location);
      }
      
      if (filters.school) {
        students = students.filter(student => student.school === filters.school);
      }
      
      if (filters.department) {
        students = students.filter(student => student.department === filters.department);
      }
      
      if (filters.section) {
        students = students.filter(student => student.section === filters.section);
      }
      
      // Apply attendance stage filtering
      if (filters.attendanceStage) {
        switch (filters.attendanceStage) {
          case 'robeSlot1':
            // Show all students for the first robe slot
            break;
          case 'robeSlot1Completed':
            // For the second robe slot, only show students who completed the first slot
            students = students.filter(student => student.robeSlot1 === true);
            break;
          case 'bothRobeSlotsCompleted':
            // For folder-in-charge, only show students who completed both robe slots
            students = students.filter(student => student.robeSlot1 === true && student.robeSlot2 === true);
            break;
          case 'folderCompleted':
            // For presenter, only show students who have completed all previous steps
            students = students.filter(student => 
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
      
      // Calculate total pages
      const total = students.length;
      const page = filters.page || 1;
      const pageSize = filters.pageSize || DEFAULT_PAGE_SIZE;
      const totalPages = Math.ceil(total / pageSize);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const paginatedStudents = students.slice(startIndex, startIndex + pageSize);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: paginatedStudents,
        total,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error("Error fetching students:", error);
      throw error;
    }
  },
  
  async getFilterOptions(field: 'location' | 'school' | 'department' | 'section'): Promise<FilterOption[]> {
    try {
      // In a real implementation, this would be a fetch call to your API:
      // const response = await fetch(`${API_BASE_URL}/filters/${field}`)
      // return await response.json()
      
      // For demo, we're simulating the API call with localStorage
      const storedStudents = localStorage.getItem('convocation_students');
      const students: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
      
      const uniqueValues = Array.from(new Set(students.map(student => student[field])));
      return uniqueValues.map(value => ({ value, label: value }));
    } catch (error) {
      console.error(`Error fetching ${field} options:`, error);
      return [];
    }
  },
  
  async updateStudentStatus(
    studentId: string, 
    status: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    value: boolean
  ): Promise<Student> {
    try {
      // In a real implementation, this would be a fetch call to your API:
      // const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [status]: value })
      // })
      // return await response.json()
      
      // For demo, we're simulating the API call with localStorage
      const storedStudents = localStorage.getItem('convocation_students');
      let students: Student[] = storedStudents ? JSON.parse(storedStudents) : [];
      
      let updatedStudent: Student | undefined;
      
      const updatedStudents = students.map(student => {
        if (student.id === studentId) {
          updatedStudent = { ...student, [status]: value };
          return updatedStudent;
        }
        return student;
      });
      
      localStorage.setItem('convocation_students', JSON.stringify(updatedStudents));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!updatedStudent) {
        throw new Error('Student not found');
      }
      
      return updatedStudent;
    } catch (error) {
      console.error(`Error updating student status:`, error);
      throw error;
    }
  },
  
  async syncData(): Promise<void> {
    try {
      // In a real implementation, this would sync any pending changes with your server
      // const response = await fetch(`${API_BASE_URL}/sync`, { method: 'POST' });
      // return await response.json();
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return;
    } catch (error) {
      console.error("Error syncing data:", error);
      throw error;
    }
  }
};
