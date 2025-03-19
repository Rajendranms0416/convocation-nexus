
/**
 * Excel Service - Main entry point that exports all functionality
 */
import { parseCSV } from './parsers';
import { validateTeacherData } from './validators';
import { enhanceTeacherData, saveTeacherData, getTeacherData, generateCSV } from './dataManipulation';

// Re-export all functionality through a single service object
export const excelService = {
  parseCSV,
  validateTeacherData,
  enhanceTeacherData,
  saveTeacherData,
  getTeacherData,
  generateCSV
};

export default excelService;
