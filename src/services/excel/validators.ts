
/**
 * Excel Service - Data validation functionality
 */
import { enhanceTeacherData } from './enhance';

/**
 * Validate that the data has basic structure, but without requiring specific columns
 * @param data The data to validate
 * @returns true if valid, throws error if invalid
 */
export const validateTeacherData = (data: Record<string, string>[]): boolean => {
  if (!data || data.length === 0) {
    throw new Error('No data found in the file');
  }
  
  // No specific column requirements - accept any columns
  console.log('Available columns:', Object.keys(data[0]));
  
  // Just check that we have some data with at least one column
  const firstRow = data[0];
  if (Object.keys(firstRow).length === 0) {
    throw new Error('File contains no columns');
  }
  
  return true;
};
