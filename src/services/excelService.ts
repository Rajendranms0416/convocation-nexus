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
      
      // Handle CSV files where headers might be spread across multiple rows
      // First, try to find the row that contains essential columns
      let headerRowIndex = 0;
      let headers: string[] = [];
      
      // Look through the first few rows to find header row
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const potentialHeaders = rows[i].split(',')
          .map(h => h.trim())
          .map(h => h.replace(/^["'](.*)["']$/, '$1').trim());
          
        // Check if this row contains email-related headers
        if (potentialHeaders.some(h => 
          h.toLowerCase().includes('email') || 
          h.toLowerCase().includes('robe') ||
          h.toLowerCase().includes('folder'))) {
          headerRowIndex = i;
          headers = potentialHeaders;
          break;
        }
      }
      
      // If we didn't find headers in first 5 rows, use the first row
      if (headers.length === 0) {
        headers = rows[0].split(',')
          .map(h => h.trim())
          .map(h => h.replace(/^["'](.*)["']$/, '$1').trim());
      }
      
      console.log('Parsed CSV headers:', headers);
      
      // If we see there's a header that looks like it's been split incorrectly due to quotes
      // let's try to reconstruct proper headers
      if (headers.some(h => h.startsWith('"') && !h.endsWith('"'))) {
        // The CSV might have headers with quotes that contain commas
        // Try to re-parse the header row properly
        let headerRow = rows[headerRowIndex];
        let reconstructedHeaders: string[] = [];
        let currentHeader = '';
        let inQuotes = false;
        
        for (let i = 0; i < headerRow.length; i++) {
          const char = headerRow[i];
          
          if (char === '"' && (i === 0 || headerRow[i-1] !== '\\')) {
            inQuotes = !inQuotes;
            // Don't add quote characters to the header name
            continue;
          } 
          
          if (char === ',' && !inQuotes) {
            reconstructedHeaders.push(currentHeader.trim());
            currentHeader = '';
          } else {
            currentHeader += char;
          }
        }
        
        // Add the last header
        if (currentHeader.trim()) {
          reconstructedHeaders.push(currentHeader.trim());
        }
        
        headers = reconstructedHeaders;
        console.log('Reconstructed headers:', headers);
      }
      
      // If headers still look problematic, try to extract from the entire content
      if (headers.length < 3) {
        // Join all rows and look for email patterns
        const fullContent = rows.join(',');
        
        // Look for common patterns like "Robe Email ID" or "Email" in the full content
        const emailPattern = /(?:Robe|Folder)?\s*Email(?:\s*ID)?/gi;
        const emailMatches = fullContent.match(emailPattern);
        
        if (emailMatches && emailMatches.length > 0) {
          console.log('Found email fields in full content:', emailMatches);
          
          // Add these to headers if they're not already there
          emailMatches.forEach(match => {
            if (!headers.some(h => h.toLowerCase().includes(match.toLowerCase()))) {
              headers.push(match);
            }
          });
        }
        
        // Ensure we have a Programme Name column
        if (!headers.some(h => h.toLowerCase().includes('programme') || h.toLowerCase().includes('program'))) {
          headers.push('Programme Name');
        }
      }
      
      // Skip header row and other potential header rows
      // Process each data row starting from the row after headers
      const startRow = headerRowIndex + 1;
      const data = rows.slice(startRow)
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
            if (header) { // Only add non-empty headers
              rowData[header] = values[index] || '';
            }
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
    
    // First try to normalize the data
    const normalizedData = excelService.normalizeColumnNames(data);
    
    // After normalization, check if required columns are present
    const normalizedFirstRow = normalizedData[0];
    const normalizedColumns = Object.keys(normalizedFirstRow);
    
    console.log('Normalized columns:', normalizedColumns);
    
    const missingColumns: string[] = [];
    
    requiredColumns.forEach(requiredCol => {
      // Check if the column exists after normalization
      if (!normalizedColumns.includes(requiredCol)) {
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
      'Robe Email ID': ['robe email', 'robeemail', 'robe', 'robe id', 'robe email address', 'accompanying teacher'],
      'Folder Email ID': ['folder email', 'folderemail', 'folder', 'folder id', 'folder email address', 'folder in charge'],
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
    
    // Create a new array with normalized columns
    const result = data.map(row => {
      const normalizedRow: Record<string, string> = {};
      
      // First copy existing columns
      Object.entries(row).forEach(([col, value]) => {
        normalizedRow[col] = value;
      });
      
      // Then add normalized column mappings 
      Object.entries(normalizedColumnMap).forEach(([originalCol, normalizedCol]) => {
        if (row[originalCol]) {
          normalizedRow[normalizedCol] = row[originalCol];
        }
      });
      
      return normalizedRow;
    });
    
    // Check if any email column is missing but we can infer it from other data
    if (!normalizedColumnMap['Robe Email ID'] && !normalizedColumnMap['Folder Email ID']) {
      // Create these columns if we can infer them from the data
      result.forEach(row => {
        // Look for any columns that might contain email addresses
        for (const [col, value] of Object.entries(row)) {
          if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
            // Found an email - determine if it's for robe or folder
            if (col.toLowerCase().includes('accompanying') || col.toLowerCase().includes('robe')) {
              row['Robe Email ID'] = value;
            } else if (col.toLowerCase().includes('folder') || col.toLowerCase().includes('in charge')) {
              row['Folder Email ID'] = value;
            } else {
              // If no clear indication, add to both with a note
              if (!row['Robe Email ID']) row['Robe Email ID'] = value;
              if (!row['Folder Email ID']) row['Folder Email ID'] = value;
            }
          }
        }
      });
    }
    
    // If we still don't have required columns but we have other data,
    // create empty placeholders to avoid validation errors
    result.forEach(row => {
      if (!row['Programme Name'] && Object.keys(row).length > 0) {
        row['Programme Name'] = 'Unknown Programme';
      }
      if (!row['Robe Email ID'] && Object.keys(row).length > 0) {
        row['Robe Email ID'] = '';
      }
      if (!row['Folder Email ID'] && Object.keys(row).length > 0) {
        row['Folder Email ID'] = '';
      }
    });
    
    return result;
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
