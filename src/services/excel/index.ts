
/**
 * Excel Service - Main entry point that exports all functionality
 */
import { parseCSV, parseExcel } from './parsers';
import { validateTeacherData } from './validators';
import { enhanceTeacherData } from './enhance';
import { saveTeacherData, getTeacherData } from './database';
import { generateCSV } from './export';

/**
 * Filter teacher data based on search criteria
 * @param data The teacher data to filter
 * @param searchTerm The search term to filter by
 * @returns Filtered teacher data
 */
export const filterTeacherData = (data: Record<string, string>[], searchTerm: string): Record<string, string>[] => {
  if (!searchTerm || searchTerm.trim() === '') {
    return data;
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return data.filter(teacher => {
    // Search across all fields in the teacher record
    return Object.values(teacher).some(value => 
      value && typeof value === 'string' && value.toLowerCase().includes(term)
    );
  });
};

// Re-export all functionality through a single service object
export const excelService = {
  parseCSV,
  parseExcel,
  validateTeacherData,
  enhanceTeacherData,
  saveTeacherData,
  getTeacherData,
  generateCSV,
  filterTeacherData
};

export default excelService;
