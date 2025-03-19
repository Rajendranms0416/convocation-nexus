
/**
 * Excel Service - Data manipulation functionality
 * This file re-exports functionality from more focused files
 */
import { enhanceTeacherData } from './enhance';
import { saveTeacherData, getTeacherData } from './database';
import { generateCSV } from './export';

// Re-export all functionality for backward compatibility
export {
  enhanceTeacherData,
  saveTeacherData,
  getTeacherData,
  generateCSV
};
