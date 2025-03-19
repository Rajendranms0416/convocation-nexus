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
      
      // First, search through the entire file content for email patterns
      const fullContent = csvString;
      const emailMatches = fullContent.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
      console.log('Found email patterns in full content:', emailMatches);
      
      // Handle CSV files where headers might be spread across multiple rows
      // First, try to find the row that contains essential columns
      let headerRowIndex = 0;
      let headers: string[] = [];
      
      // Look through more rows to find potential header row
      for (let i = 0; i < Math.min(10, rows.length); i++) {
        const potentialHeaders = rows[i].split(',')
          .map(h => h.trim())
          .map(h => h.replace(/^["'](.*)["']$/, '$1').trim());
          
        // Check if this row contains potential headers
        if (potentialHeaders.some(h => 
          h.toLowerCase().includes('email') || 
          h.toLowerCase().includes('robe') ||
          h.toLowerCase().includes('folder') ||
          h.toLowerCase().includes('program') ||
          h.toLowerCase().includes('teacher')
        )) {
          headerRowIndex = i;
          headers = potentialHeaders;
          break;
        }
      }
      
      // If we didn't find headers in first rows, use the first row
      if (headers.length === 0) {
        headers = rows[0].split(',')
          .map(h => h.trim())
          .map(h => h.replace(/^["'](.*)["']$/, '$1').trim());
      }
      
      console.log('Initial parsed CSV headers:', headers);
      
      // If we see there's a header that looks like it's been split incorrectly due to quotes
      // let's try to reconstruct proper headers
      if (headers.some(h => h.startsWith('"') && !h.endsWith('"')) || 
          headers.join('').includes('"')) {
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
      
      // Sheet-wide search for emails and programme information
      const enhancedData = data.map(row => {
        const enhancedRow = { ...row };
        let foundRobeEmail = false;
        let foundFolderEmail = false;
        let foundProgramme = false;
        
        // Check all fields for email patterns and mark as robe or folder
        for (const [key, value] of Object.entries(row)) {
          // Look for emails in any field
          if (typeof value === 'string' && value.includes('@') && value.includes('.')) {
            const lowercaseKey = key.toLowerCase();
            
            // Determine if it's for robe or folder based on the field name
            if (lowercaseKey.includes('accompanying') || 
                lowercaseKey.includes('robe') || 
                lowercaseKey.includes('teacher') && !foundRobeEmail) {
              enhancedRow['Robe Email ID'] = value;
              foundRobeEmail = true;
            } else if (lowercaseKey.includes('folder') || 
                      lowercaseKey.includes('in charge') && !foundFolderEmail) {
              enhancedRow['Folder Email ID'] = value;
              foundFolderEmail = true;
            } 
            // If there's no clear indication but we don't have one category yet
            else if (!foundRobeEmail && !foundFolderEmail) {
              // First email we find goes to robe
              enhancedRow['Robe Email ID'] = value;
              foundRobeEmail = true;
            } else if (foundRobeEmail && !foundFolderEmail) {
              // Second email we find goes to folder
              enhancedRow['Folder Email ID'] = value;
              foundFolderEmail = true;
            }
          }
          
          // Look for programme name in any field
          if (!foundProgramme && typeof value === 'string' && 
              (value.toLowerCase().includes('program') || 
               value.toLowerCase().includes('course') || 
               value.toLowerCase().includes('bachelor') || 
               value.toLowerCase().includes('master') || 
               value.toLowerCase().includes('bca') || 
               value.toLowerCase().includes('mca'))) {
            enhancedRow['Programme Name'] = value;
            foundProgramme = true;
          } else if (!foundProgramme && key.toLowerCase().includes('program')) {
            enhancedRow['Programme Name'] = value;
            foundProgramme = true;
          }
        }
        
        // If we still don't have emails, check if there are values in the original data that look like names
        if (!foundRobeEmail || !foundFolderEmail) {
          // Try to use teacher names if we have them
          for (const [key, value] of Object.entries(row)) {
            const lowercaseKey = key.toLowerCase();
            if ((lowercaseKey.includes('teacher') || lowercaseKey.includes('name') || 
                 lowercaseKey.includes('staff') || lowercaseKey.includes('faculty')) && 
                value && typeof value === 'string' && value.length > 2) {
              
              // If we have a teacher name but no robe email
              if (!foundRobeEmail) {
                enhancedRow['Accompanying Teacher'] = value;
                enhancedRow['Robe Email ID'] = emailMatches[0] || '';
                foundRobeEmail = true;
              } 
              // If we have a different teacher name for folder role
              else if (!foundFolderEmail && enhancedRow['Accompanying Teacher'] !== value) {
                enhancedRow['Folder in Charge'] = value;
                enhancedRow['Folder Email ID'] = emailMatches[1] || emailMatches[0] || '';
                foundFolderEmail = true;
              }
            }
          }
        }
        
        // Ensure we have some basic data for required fields
        if (!enhancedRow['Programme Name']) {
          // Look for anything that might be a programme name
          for (const [key, value] of Object.entries(row)) {
            if (typeof value === 'string' && 
                (key.toLowerCase().includes('class') || 
                 key.toLowerCase().includes('course'))) {
              enhancedRow['Programme Name'] = value;
              break;
            }
          }
          // If still not found, use a default
          if (!enhancedRow['Programme Name']) {
            enhancedRow['Programme Name'] = 'Unknown Programme';
          }
        }
        
        return enhancedRow;
      });
      
      return enhancedData;
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
      // Try one more sheet-wide data enhancement before failing
      const enhancedData = excelService.enhanceTeacherData(normalizedData);
      
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
          throw new Error(`Missing required columns: ${stillMissing.join(', ')}`);
        }
        
        // If we got here, the enhanced data has all required columns
        return true;
      }
      
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    return true;
  },
  
  /**
   * Enhance teacher data by searching sheet-wide for needed information
   * @param data Initial teacher data
   * @returns Enhanced data with required columns filled
   */
  enhanceTeacherData: (data: Record<string, string>[]): Record<string, string>[] => {
    if (!data || data.length === 0) return data;
    
    // Extract all potential emails from the entire dataset
    const allEmails: string[] = [];
    data.forEach(row => {
      Object.values(row).forEach(value => {
        if (typeof value === 'string') {
          const emailMatches = value.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
          allEmails.push(...emailMatches);
        }
      });
    });
    
    console.log('All emails found in data:', allEmails);
    
    // Extract all potential teacher names
    const allTeacherNames: string[] = [];
    data.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 2 && 
            (key.toLowerCase().includes('teacher') || 
             key.toLowerCase().includes('name') || 
             key.toLowerCase().includes('faculty'))) {
          allTeacherNames.push(value);
        }
      });
    });
    
    console.log('All teacher names found:', allTeacherNames);
    
    // Now enhance each row
    return data.map((row, index) => {
      const enhancedRow = { ...row };
      
      // Ensure Programme Name
      if (!enhancedRow['Programme Name']) {
        enhancedRow['Programme Name'] = 'Unknown Programme';
      }
      
      // Ensure Robe Email ID
      if (!enhancedRow['Robe Email ID']) {
        // Try to find any key that might contain a robe email
        const robeKey = Object.keys(row).find(k => 
          k.toLowerCase().includes('robe') || 
          k.toLowerCase().includes('accompanying') ||
          k.toLowerCase().includes('teacher email')
        );
        
        if (robeKey && row[robeKey] && row[robeKey].includes('@')) {
          enhancedRow['Robe Email ID'] = row[robeKey];
        } else if (allEmails.length > 0) {
          // Use the first available email
          enhancedRow['Robe Email ID'] = allEmails[0];
        } else {
          enhancedRow['Robe Email ID'] = '';
        }
      }
      
      // Ensure Folder Email ID
      if (!enhancedRow['Folder Email ID']) {
        // Try to find any key that might contain a folder email
        const folderKey = Object.keys(row).find(k => 
          k.toLowerCase().includes('folder') || 
          k.toLowerCase().includes('in charge') ||
          k.toLowerCase().includes('coordinator email')
        );
        
        if (folderKey && row[folderKey] && row[folderKey].includes('@')) {
          enhancedRow['Folder Email ID'] = row[folderKey];
        } else if (allEmails.length > 1) {
          // Use the second available email
          enhancedRow['Folder Email ID'] = allEmails[1];
        } else if (allEmails.length === 1) {
          // If only one email, use it for both roles
          enhancedRow['Folder Email ID'] = allEmails[0];
        } else {
          enhancedRow['Folder Email ID'] = '';
        }
      }
      
      // If we have teacher names but no emails, match them
      if (!enhancedRow['Accompanying Teacher'] && allTeacherNames.length > 0) {
        enhancedRow['Accompanying Teacher'] = allTeacherNames[0];
      }
      
      if (!enhancedRow['Folder in Charge'] && allTeacherNames.length > 1) {
        enhancedRow['Folder in Charge'] = allTeacherNames[1];
      } else if (!enhancedRow['Folder in Charge'] && allTeacherNames.length === 1) {
        enhancedRow['Folder in Charge'] = allTeacherNames[0];
      }
      
      return enhancedRow;
    });
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
      'Programme Name': ['program', 'programme', 'program name', 'course', 'course name', 'class'],
      'Robe Email ID': ['robe email', 'robeemail', 'robe', 'robe id', 'robe email address', 'accompanying teacher email', 'teacher email'],
      'Folder Email ID': ['folder email', 'folderemail', 'folder', 'folder id', 'folder email address', 'folder in charge email', 'coordinator email'],
      'Accompanying Teacher': ['accompanying', 'teacher', 'faculty', 'teacher name', 'robe teacher'],
      'Folder in Charge': ['in charge', 'folder teacher', 'coordinator', 'folder holder']
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
    
    // Apply sheet-wide enhancements to the result
    return excelService.enhanceTeacherData(result);
  },
  
  /**
   * Save data to localStorage and update the application state
   * @param data The data to save
   * @returns The saved data
   */
  saveTeacherData: (data: Record<string, string>[]): Record<string, string>[] => {
    // First normalize column names and enhance data
    const normalizedData = excelService.normalizeColumnNames(data);
    const enhancedData = excelService.enhanceTeacherData(normalizedData);
    console.log('Final data to save:', enhancedData);
    return updateTeachersList(enhancedData);
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

