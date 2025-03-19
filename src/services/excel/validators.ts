
/**
 * Excel Service - Data validation functionality
 */
import { enhanceTeacherData } from './dataManipulation';

/**
 * Validate that the data has the required structure
 * @param data The data to validate
 * @returns true if valid, throws error if invalid
 */
export const validateTeacherData = (data: Record<string, string>[]): boolean => {
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
  
  // Check if required columns are present
  const missingColumns: string[] = [];
  
  requiredColumns.forEach(requiredCol => {
    if (!availableColumns.includes(requiredCol)) {
      missingColumns.push(requiredCol);
    }
  });
  
  if (missingColumns.length > 0) {
    // Try one more sheet-wide data enhancement before failing
    const extractedEmails: string[] = [];
    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (typeof value === 'string') {
          const emailMatches = value.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
          extractedEmails.push(...emailMatches);
        }
      });
    });
    
    const enhancedData = enhanceTeacherData(data, extractedEmails);
    
    // Check again after the enhancement
    if (enhancedData.length > 0) {
      const enhancedColumns = Object.keys(enhancedData[0]);
      const stillMissing: string[] = [];
      
      requiredColumns.forEach(requiredCol => {
        if (!enhancedColumns.includes(requiredCol)) {
          stillMissing.push(requiredCol);
        }
      });
      
      if (stillMissing.length > 0) {
        // Create very clear error message
        throw new Error(`Missing required columns: ${stillMissing.join(', ')}. Please ensure your CSV has these exact column headers: Programme Name, Robe Email ID, Folder Email ID.`);
      }
    }
  }
  
  // Validate that every row has the minimum data needed
  data.forEach((row, index) => {
    // Check if program name is present
    if (!row['Programme Name'] || row['Programme Name'].trim() === '') {
      // Try to find any value that might be a program name
      const programKey = Object.keys(row).find(key => 
        key.toLowerCase().includes('program') || 
        key.toLowerCase().includes('course') ||
        key.toLowerCase().includes('class')
      );
      
      if (programKey && row[programKey]) {
        row['Programme Name'] = row[programKey];
      } else {
        row['Programme Name'] = `Unknown Program ${index + 1}`;
      }
    }
    
    // Ensure there's at least one email address
    if ((!row['Robe Email ID'] || row['Robe Email ID'].trim() === '') &&
        (!row['Folder Email ID'] || row['Folder Email ID'].trim() === '')) {
      
      // Look for any field that might contain an email
      const emailFound = Object.values(row).some(value => 
        typeof value === 'string' && 
        value.includes('@') && 
        value.includes('.')
      );
      
      if (!emailFound) {
        console.warn(`Row ${index + 1} has no email addresses`);
        // We don't throw an error here, as we'll try to enhance the data later
      }
    }
  });
  
  return true;
};
