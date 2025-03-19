
/**
 * Excel Service for handling operations related to Excel data imports/exports
 */
import { updateTeachersList, getAllTeachers } from '@/utils/authHelpers';

export const excelService = {
  /**
   * Parse CSV data from a string
   * @param csvString The CSV string to parse
   * @returns Parsed data as an array of objects
   */
  parseCSV: (csvString: string): Record<string, string>[] => {
    try {
      // Split by lines
      const rows = csvString.split(/\r?\n/);
      
      // Get headers from first row
      const headers = rows[0].split(',').map(h => h.trim());
      
      // Process each data row
      const data = rows.slice(1)
        .filter(row => row.trim() !== '') // Skip empty rows
        .map(row => {
          // Handle quoted values that may contain commas
          const values: string[] = [];
          let inQuotes = false;
          let currentValue = '';
          
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            
            if (char === '"' && (i === 0 || row[i-1] !== '\\')) {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          
          // Add the last value
          values.push(currentValue.trim());
          
          // Create object mapping headers to values
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || '';
          });
          
          return rowData;
        });
      
      return data;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV data');
    }
  },
  
  /**
   * Validate that the data has the required structure
   * @param data The data to validate
   * @returns true if valid, throws error if invalid
   */
  validateTeacherData: (data: Record<string, string>[]): boolean => {
    if (!data || data.length === 0) {
      throw new Error('No data found in the file');
    }
    
    const requiredColumns = [
      'Programme Name',
      'Robe Email ID',
      'Folder Email ID'
    ];
    
    // Check if required columns exist
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    return true;
  },
  
  /**
   * Save data to localStorage and update the application state
   * @param data The data to save
   * @returns The saved data
   */
  saveTeacherData: (data: Record<string, string>[]): Record<string, string>[] => {
    return updateTeachersList(data);
  },
  
  /**
   * Get all teacher data
   * @returns All teacher data
   */
  getTeacherData: (): Record<string, string>[] => {
    return getAllTeachers();
  },
  
  /**
   * Generate a CSV file from the current teacher data
   * @returns CSV content as a string
   */
  generateCSV: (): string => {
    const teachers = getAllTeachers();
    
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
  }
};

export default excelService;
