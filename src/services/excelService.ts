
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
      
      if (rows.length === 0) {
        throw new Error('Empty CSV file');
      }
      
      // Get headers from first row and normalize them
      const headers = rows[0].split(',')
        .map(h => h.trim())
        // Normalize header names by removing quotes and extra spaces
        .map(h => h.replace(/^["'](.*)["']$/, '$1').trim());
      
      console.log('Parsed CSV headers:', headers);
      
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
    
    // Look for required columns with case-insensitive and flexible matching
    const requiredColumns = [
      'Programme Name',
      'Robe Email ID',
      'Folder Email ID'
    ];
    
    // Check for required columns with flexible matching
    const firstRow = data[0];
    const availableColumns = Object.keys(firstRow);
    
    // For debugging
    console.log('Available columns:', availableColumns);
    
    const missingColumns: string[] = [];
    
    requiredColumns.forEach(requiredCol => {
      // Try to find a match (case-insensitive, ignoring spaces and special chars)
      const normalizedRequiredCol = requiredCol.toLowerCase().replace(/[^a-z0-9]/gi, '');
      const found = availableColumns.some(col => {
        const normalizedCol = col.toLowerCase().replace(/[^a-z0-9]/gi, '');
        return normalizedCol === normalizedRequiredCol || 
               normalizedCol === normalizedRequiredCol.replace('id', '') ||
               (normalizedRequiredCol.includes('email') && normalizedCol.includes('email'));
      });
      
      if (!found) {
        missingColumns.push(requiredCol);
      }
    });
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    return true;
  },
  
  /**
   * Normalize column names to match expected format
   * @param data The data with potentially non-standard column names
   * @returns Data with normalized column names
   */
  normalizeColumnNames: (data: Record<string, string>[]): Record<string, string>[] => {
    if (!data || data.length === 0) return data;
    
    // Define mappings for common variations of column names
    const columnMappings: Record<string, string[]> = {
      'Programme Name': ['program', 'programme', 'program name', 'course', 'course name'],
      'Robe Email ID': ['robe email', 'robeemail', 'robe', 'robe id', 'robe email address'],
      'Folder Email ID': ['folder email', 'folderemail', 'folder', 'folder id', 'folder email address']
    };
    
    // Get all columns from the first row
    const originalColumns = Object.keys(data[0]);
    
    // Create a mapping of original to normalized column names
    const normalizedColumnMap: Record<string, string> = {};
    
    originalColumns.forEach(originalCol => {
      const lowerCol = originalCol.toLowerCase().trim();
      
      // Check each standard column name
      for (const [standardCol, variations] of Object.entries(columnMappings)) {
        if (variations.some(v => lowerCol.includes(v.toLowerCase())) || 
            lowerCol.replace(/[^a-z0-9]/gi, '').includes(standardCol.toLowerCase().replace(/[^a-z0-9]/gi, ''))) {
          normalizedColumnMap[originalCol] = standardCol;
          break;
        }
      }
    });
    
    console.log('Column name mapping:', normalizedColumnMap);
    
    // Apply the mapping to each row
    return data.map(row => {
      const normalizedRow: Record<string, string> = {};
      
      Object.entries(row).forEach(([col, value]) => {
        const normalizedCol = normalizedColumnMap[col] || col;
        normalizedRow[normalizedCol] = value;
      });
      
      return normalizedRow;
    });
  },
  
  /**
   * Save data to localStorage and update the application state
   * @param data The data to save
   * @returns The saved data
   */
  saveTeacherData: (data: Record<string, string>[]): Record<string, string>[] => {
    // First normalize column names
    const normalizedData = excelService.normalizeColumnNames(data);
    return updateTeachersList(normalizedData);
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
