
/**
 * Excel Service for handling operations related to Excel data imports/exports
 */
import { updateTeachersList, getAllTeachers } from '@/utils/authHelpers';

export const excelService = {
  /**
   * Parse CSV data from a string
   * @param csvString The CSV string to parse
   * @param debug Optional flag to enable debug logs
   * @returns Parsed data as an array of objects
   */
  parseCSV: (csvString: string, debug = false): Record<string, string>[] => {
    try {
      if (debug) {
        console.log('CSV string length:', csvString.length);
        console.log('First 100 chars:', csvString.substring(0, 100));
      }
      
      // Check for common BOM marker and remove it
      const bomStripped = csvString.replace(/^\uFEFF/, '');
      
      // Split by lines and remove empty lines
      const rows = bomStripped.split(/\r?\n/).filter(row => row.trim() !== '');
      
      if (rows.length === 0) {
        throw new Error('Empty CSV file or no valid rows found');
      }
      
      if (debug) {
        console.log('Number of rows:', rows.length);
        console.log('First row:', rows[0]);
      }
      
      // First detect if this is a simple CSV with just the needed columns
      // or if it's a more complex format that needs intelligent parsing
      const firstRow = rows[0].toLowerCase();
      const isSimpleFormat = 
        firstRow.includes('programme') && 
        (firstRow.includes('robe') || firstRow.includes('folder') || firstRow.includes('name'));
      
      if (debug) {
        console.log('Detected simple format:', isSimpleFormat);
      }
      
      let parsedData: Record<string, string>[] = [];
      
      // Extract all potential emails from the dataset for later use
      const allEmails: string[] = [];
      const programNames: string[] = [];
      const teacherNames: string[] = [];
      
      // First pass: collect all emails, potential program names, and teacher names
      rows.forEach(row => {
        // Find emails
        const emailMatches = row.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
        allEmails.push(...emailMatches);
        
        // Find potential program names (anything with digit+letters pattern common in course codes)
        const potentialPrograms = row.match(/\b\d+[A-Za-z]+\b/g) || [];
        programNames.push(...potentialPrograms);
        
        // Also match full program names
        if (row.toLowerCase().includes('bachelor') || 
            row.toLowerCase().includes('master') || 
            row.toLowerCase().includes('programme')) {
          const parts = row.split(',');
          parts.forEach(part => {
            if (part.trim().length > 5) {  // Arbitrary length to filter out short segments
              programNames.push(part.trim());
            }
          });
        }
        
        // Match potential teacher names
        const parts = row.split(',');
        parts.forEach(part => {
          const trimmedPart = part.trim();
          // Check if part is likely to be a name (no digits, not an email, etc.)
          if (trimmedPart.length > 3 && 
              !trimmedPart.includes('@') && 
              !/\d/.test(trimmedPart) &&
              !/programme|email|folder|robe/i.test(trimmedPart)) {
            teacherNames.push(trimmedPart);
          }
        });
      });
      
      if (debug && !isSimpleFormat) {
        console.log('All found emails:', allEmails);
        console.log('Potential program names:', programNames);
        console.log('Potential teacher names:', teacherNames);
      }
      
      if (isSimpleFormat) {
        // Simple parsing for standard CSV
        const headers = excelService.parseCSVRow(rows[0]);
        
        if (debug) {
          console.log('Found headers:', headers);
        }
        
        // Process each data row
        parsedData = rows.slice(1)
          .filter(row => row.trim() !== '')
          .map(row => {
            const values = excelService.parseCSVRow(row);
            const rowData: Record<string, string> = {};
            
            headers.forEach((header, index) => {
              if (header && index < values.length) {
                // Normalize header names directly
                const normalizedHeader = excelService.normalizeHeaderName(header);
                rowData[normalizedHeader] = values[index] || '';
              }
            });
            
            return rowData;
          });
      } else {
        // More complex parsing logic for non-standard formats
        // Determine likely headers
        let headerRowIndex = -1;
        let headerCandidate = '';
        
        // Look for rows that might contain headers
        for (let i = 0; i < Math.min(10, rows.length); i++) {
          const lowercaseRow = rows[i].toLowerCase();
          if (lowercaseRow.includes('programme') || 
              lowercaseRow.includes('program') || 
              lowercaseRow.includes('email') ||
              lowercaseRow.includes('robe') ||
              lowercaseRow.includes('folder') ||
              lowercaseRow.includes('name')) {
            headerRowIndex = i;
            headerCandidate = rows[i];
            break;
          }
        }
        
        let headers: string[] = [];
        if (headerRowIndex >= 0) {
          headers = excelService.parseCSVRow(headerCandidate);
          if (debug) {
            console.log('Found header row at index', headerRowIndex, ':', headers);
          }
        } else {
          // If no header row found, create default headers
          headers = ['Programme Name', 'Robe Email ID', 'Folder Email ID', 'Accompanying Teacher', 'Folder in Charge'];
          headerRowIndex = -1; // Indicates we're using default headers
          if (debug) {
            console.log('No header row found, using default headers');
          }
        }
        
        // Create normalized headers
        const normalizedHeaders = headers.map(header => 
          excelService.normalizeHeaderName(header)
        );
        
        if (debug) {
          console.log('Normalized headers:', normalizedHeaders);
        }
        
        // Process rows into data
        if (headerRowIndex >= 0) {
          // Standard processing with found headers
          parsedData = rows.slice(headerRowIndex + 1)
            .filter(row => row.trim() !== '')
            .map(row => {
              const values = excelService.parseCSVRow(row);
              const rowData: Record<string, string> = {};
              
              normalizedHeaders.forEach((header, index) => {
                if (header && index < values.length) {
                  rowData[header] = values[index] || '';
                }
              });
              
              return rowData;
            });
        } else {
          // Special case: No headers found, try to extract data by position or patterns
          parsedData = rows.map((row, rowIndex) => {
            const values = excelService.parseCSVRow(row);
            let rowData: Record<string, string> = {
              'Programme Name': '',
              'Robe Email ID': '',
              'Folder Email ID': '',
              'Accompanying Teacher': '',
              'Folder in Charge': ''
            };
            
            // Try to intelligently assign values
            values.forEach(value => {
              if (value.includes('@')) {
                // This is likely an email
                if (!rowData['Robe Email ID']) {
                  rowData['Robe Email ID'] = value;
                } else if (!rowData['Folder Email ID']) {
                  rowData['Folder Email ID'] = value;
                }
              } else if (/\b\d+[A-Za-z]+\b/.test(value) || 
                         value.length > 5) {
                // This could be a program code or name
                if (!rowData['Programme Name']) {
                  rowData['Programme Name'] = value;
                } else if (!rowData['Accompanying Teacher'] && !value.includes('programme') && !value.toLowerCase().includes('name')) {
                  rowData['Accompanying Teacher'] = value;
                } else if (!rowData['Folder in Charge'] && !value.includes('programme') && !value.toLowerCase().includes('name')) {
                  rowData['Folder in Charge'] = value;
                }
              }
            });
            
            return rowData;
          });
        }
      }
      
      // Filter out header rows and other invalid entries that might have been parsed as data
      parsedData = parsedData.filter(row => {
        // Skip rows that look like headers (containing words like "programme" in values)
        const hasHeaderLikeValues = Object.values(row).some(value => 
          typeof value === 'string' && 
          /programme|email|folder|accompanying|charge/i.test(value.toLowerCase())
        );
        
        // Skip rows with "Sl. No" as the Accompanying Teacher (this appears to be a common issue)
        const hasSlNoAsTeacher = row['Accompanying Teacher'] === 'Sl. No';
        
        return !hasHeaderLikeValues && !hasSlNoAsTeacher;
      });
      
      // Ensure we have the required data
      const enhancedData = excelService.enhanceTeacherData(parsedData, allEmails, teacherNames);
      
      if (debug) {
        console.log('Final parsed data:', enhancedData);
      }
      
      return enhancedData;
    } catch (error) {
      console.error('Error parsing CSV:', error);
      throw new Error('Failed to parse CSV data. Please make sure your file is correctly formatted with the required columns.');
    }
  },
  
  /**
   * Parse a single CSV row with proper handling of quoted values
   * @param rowStr The CSV row string
   * @returns Array of values from the row
   */
  parseCSVRow: (rowStr: string): string[] => {
    const result: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      const nextChar = i < rowStr.length - 1 ? rowStr[i + 1] : '';
      
      if (char === '"' && (i === 0 || rowStr[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    result.push(currentValue.trim().replace(/^"(.*)"$/, '$1'));
    
    return result;
  },
  
  /**
   * Normalize header names to standard format
   * @param headerName The original header name
   * @returns Normalized header name
   */
  normalizeHeaderName: (headerName: string): string => {
    const header = headerName.trim();
    const lowerHeader = header.toLowerCase();
    
    // Define mappings for common variations
    if (lowerHeader.includes('program') || 
        lowerHeader.includes('course') || 
        lowerHeader.includes('class')) {
      return 'Programme Name';
    } else if (lowerHeader.includes('robe') && lowerHeader.includes('email') || 
               lowerHeader.includes('teacher') && lowerHeader.includes('email') ||
               lowerHeader.includes('accompanying')) {
      return 'Robe Email ID';
    } else if (lowerHeader.includes('folder') && lowerHeader.includes('email') ||
               lowerHeader.includes('charge') && lowerHeader.includes('email')) {
      return 'Folder Email ID';
    } else if (lowerHeader.includes('name') && 
              (lowerHeader.includes('teacher') || 
               lowerHeader.includes('robe') || 
               lowerHeader.includes('accompanying'))) {
      return 'Accompanying Teacher';
    } else if (lowerHeader.includes('name') && 
              (lowerHeader.includes('folder') || 
               lowerHeader.includes('charge'))) {
      return 'Folder in Charge';
    } else if (lowerHeader.includes('teacher') && !lowerHeader.includes('email')) {
      return 'Accompanying Teacher';
    } else if (lowerHeader.includes('name') && !lowerHeader.includes('program')) {
      // If it's just a generic "name" column, assume it's a teacher name
      return 'Accompanying Teacher';
    }
    
    // Return original if no mapping found
    return header;
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
      
      const enhancedData = excelService.enhanceTeacherData(data, extractedEmails);
      
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
  },
  
  /**
   * Enhance teacher data by searching sheet-wide for needed information
   * @param data Initial teacher data
   * @param additionalEmails Optional list of all emails found in the sheet
   * @param teacherNames Optional list of all potential teacher names found in the sheet
   * @returns Enhanced data with required columns filled
   */
  enhanceTeacherData: (data: Record<string, string>[], additionalEmails: string[] = [], teacherNames: string[] = []): Record<string, string>[] => {
    if (!data || data.length === 0) return data;
    
    // Extract all potential emails from the entire dataset if not provided
    const allEmails: string[] = [...additionalEmails];
    if (additionalEmails.length === 0) {
      data.forEach(row => {
        Object.values(row).forEach(value => {
          if (typeof value === 'string') {
            const emailMatches = value.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
            allEmails.push(...emailMatches);
          }
        });
      });
    }
    
    console.log('All emails found in data:', allEmails);
    
    // Extract all potential teacher names if not provided
    const allTeacherNames: string[] = [...teacherNames];
    if (teacherNames.length === 0) {
      data.forEach(row => {
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 2 && 
              (key.toLowerCase().includes('teacher') || 
               key.toLowerCase().includes('name') || 
               key.toLowerCase().includes('faculty'))) {
            // Check if value doesn't look like "Sl. No" or other header-like values
            if (!/sl\.?\s*no|programme|email/i.test(value)) {
              allTeacherNames.push(value);
            }
          }
        });
      });
    }
    
    console.log('All teacher names found:', allTeacherNames);
    
    // Get unique teacher names and emails (avoid duplicating the same teacher)
    const uniqueTeacherNames = [...new Set(allTeacherNames)].filter(name => 
      name && name.length > 2 && !/sl\.?\s*no|class wise/i.test(name)
    );
    const uniqueEmails = [...new Set(allEmails)].filter(email => email);
    
    console.log('Unique teacher names:', uniqueTeacherNames);
    console.log('Unique emails:', uniqueEmails);
    
    // Get actual teacher names to use
    const actualTeacherNames = uniqueTeacherNames.length > 0 ? 
      uniqueTeacherNames : 
      ['Unknown Teacher'];
    
    // Now enhance each row
    return data.map((row, index) => {
      const enhancedRow = { ...row };
      
      // Ensure Programme Name
      if (!enhancedRow['Programme Name'] || enhancedRow['Programme Name'].includes('Programme')) {
        // Try to find any key that might contain a program name
        const programKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('program') || 
          key.toLowerCase().includes('course') ||
          key.toLowerCase().includes('class')
        );
        
        if (programKey && row[programKey] && !row[programKey].toLowerCase().includes('programme')) {
          enhancedRow['Programme Name'] = row[programKey];
        } else {
          enhancedRow['Programme Name'] = `Class ${index + 1}`;
        }
      }
      
      // Ensure Robe Email ID
      if (!enhancedRow['Robe Email ID'] || !enhancedRow['Robe Email ID'].includes('@')) {
        // Try to find any key that might contain a robe email
        const robeKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('robe') || 
          key.toLowerCase().includes('accompanying') ||
          key.toLowerCase().includes('teacher email')
        );
        
        if (robeKey && row[robeKey] && row[robeKey].includes('@')) {
          enhancedRow['Robe Email ID'] = row[robeKey];
        } else if (uniqueEmails.length > 0) {
          // Use the first available email
          enhancedRow['Robe Email ID'] = uniqueEmails[0];
        } else {
          enhancedRow['Robe Email ID'] = 'teacher@example.com';
        }
      }
      
      // Ensure Folder Email ID
      if (!enhancedRow['Folder Email ID'] || !enhancedRow['Folder Email ID'].includes('@')) {
        // Try to find any key that might contain a folder email
        const folderKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('folder') || 
          key.toLowerCase().includes('in charge') ||
          key.toLowerCase().includes('coordinator email')
        );
        
        if (folderKey && row[folderKey] && row[folderKey].includes('@')) {
          enhancedRow['Folder Email ID'] = row[folderKey];
        } else if (uniqueEmails.length > 1) {
          // Use the second available email
          enhancedRow['Folder Email ID'] = uniqueEmails[1];
        } else if (uniqueEmails.length === 1) {
          // If only one email, use it for both roles
          enhancedRow['Folder Email ID'] = uniqueEmails[0];
        } else {
          enhancedRow['Folder Email ID'] = 'folder@example.com';
        }
      }
      
      // Ensure Accompanying Teacher name
      if (!enhancedRow['Accompanying Teacher'] || 
          enhancedRow['Accompanying Teacher'].trim() === '' ||
          enhancedRow['Accompanying Teacher'] === 'Sl. No' ||
          /class\s*wise/i.test(enhancedRow['Accompanying Teacher'])) {
        // Try to find any key that might contain a teacher name
        const teacherKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('teacher name') || 
          key.toLowerCase().includes('accompanying') ||
          key.toLowerCase().includes('robe in charge')
        );
        
        if (teacherKey && row[teacherKey] && 
            !row[teacherKey].includes('@') && 
            row[teacherKey] !== 'Sl. No' &&
            !/class\s*wise/i.test(row[teacherKey])) {
          enhancedRow['Accompanying Teacher'] = row[teacherKey];
        } else if (actualTeacherNames.length > 0) {
          // Use the first available teacher name
          enhancedRow['Accompanying Teacher'] = actualTeacherNames[0];
        } else {
          enhancedRow['Accompanying Teacher'] = 'Robe Teacher';
        }
      }
      
      // Ensure Folder in Charge name
      if (!enhancedRow['Folder in Charge'] || 
          enhancedRow['Folder in Charge'].trim() === '' || 
          enhancedRow['Folder in Charge'] === '"Class Wise/' ||
          /class\s*wise/i.test(enhancedRow['Folder in Charge'])) {
        // Try to find any key that might contain a folder in charge name
        const folderTeacherKey = Object.keys(row).find(key => 
          key.toLowerCase().includes('folder') && key.toLowerCase().includes('charge') ||
          key.toLowerCase().includes('coordinator name')
        );
        
        if (folderTeacherKey && row[folderTeacherKey] && 
            !row[folderTeacherKey].includes('@') &&
            row[folderTeacherKey] !== '"Class Wise/' &&
            !/class\s*wise/i.test(row[folderTeacherKey])) {
          enhancedRow['Folder in Charge'] = row[folderTeacherKey];
        } else if (actualTeacherNames.length > 1) {
          // Use the second available teacher name
          enhancedRow['Folder in Charge'] = actualTeacherNames[1];
        } else if (actualTeacherNames.length === 1) {
          // If only one teacher, use it for both roles
          enhancedRow['Folder in Charge'] = actualTeacherNames[0];
        } else {
          enhancedRow['Folder in Charge'] = 'Folder Teacher';
        }
      }
      
      return enhancedRow;
    });
  },
  
  /**
   * Save data to localStorage and update the application state
   * @param data The data to save
   * @returns The saved data
   */
  saveTeacherData: (data: Record<string, string>[]): Record<string, string>[] => {
    // First enhance the data one final time
    const enhancedData = excelService.enhanceTeacherData(data);
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
