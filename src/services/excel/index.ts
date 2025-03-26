
/**
 * Excel Service - Main entry point that exports all functionality
 */
import { parseCSV, parseExcel } from './parsers';
import { validateTeacherData } from './validators';
import { enhanceTeacherData } from './enhance';
import { generateCSV } from './export';
import { getAllTeachers, updateTeachersList, getTeachersBySession } from '@/utils/authHelpers';

/**
 * Filter data based on search criteria
 * @param data The data to filter
 * @param searchTerm The search term to filter by
 * @returns Filtered data
 */
export const filterTeacherData = (data: Record<string, string>[], searchTerm: string): Record<string, string>[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return data.filter(record => {
    // Search across all fields in the record
    return Object.values(record).some(value => 
      value && typeof value === 'string' && value.toLowerCase().includes(term)
    );
  });
};

/**
 * Save teacher data with session information
 * @param data The data to save
 * @param sessionInfo The session information
 * @returns The saved data
 */
export const saveTeacherData = (data: Record<string, string>[], sessionInfo: string = '') => {
  return updateTeachersList(data, sessionInfo);
};

// Re-export all functionality through a single service object
export const excelService = {
  parseCSV,
  parseExcel,
  validateTeacherData,
  enhanceTeacherData,
  saveTeacherData,
  getTeacherData: getAllTeachers,
  getTeachersBySession,
  generateCSV,
  filterTeacherData
};

export default excelService;
