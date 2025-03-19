
/**
 * Excel Service - Data export functionality
 */
import { getAllTeachers } from '@/utils/authHelpers';

/**
 * Generate a CSV file from the current teacher data
 * @param data Optional data to use instead of fetching from storage
 * @returns CSV content as a string
 */
export const generateCSV = (data?: Record<string, string>[]): string => {
  const teachers = data || getAllTeachers();
  
  if (teachers.length === 0) {
    return '';
  }
  
  // Get all unique headers
  const allHeaders = new Set<string>();
  teachers.forEach(teacher => {
    Object.keys(teacher).forEach(key => allHeaders.add(key));
  });
  
  const headers = Array.from(allHeaders);
  const headerRow = headers.join(',');
  
  // Generate rows
  const rows = teachers.map(teacher => 
    headers.map(header => {
      const value = teacher[header] || '';
      // Escape values with commas or quotes
      return value.includes(',') || value.includes('"') 
        ? `"${value.replace(/"/g, '""')}"` 
        : value;
    }).join(',')
  );
  
  return [headerRow, ...rows].join('\n');
};
