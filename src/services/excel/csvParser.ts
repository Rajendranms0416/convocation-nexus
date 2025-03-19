
import { enhanceTeacherData } from './enhance';
import { normalizeHeaderName } from './utils';

/**
 * Parse a single CSV row with proper handling of quoted values
 * @param rowStr The CSV row string
 * @returns Array of values from the row
 */
export const parseCSVRow = (rowStr: string): string[] => {
  const result: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    
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
};

/**
 * Parse CSV data from a string
 * @param csvString The CSV string to parse
 * @param debug Optional flag to enable debug logs
 * @returns Parsed data as an array of objects
 */
export const parseCSV = (csvString: string, debug = false): Record<string, string>[] => {
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
      parsedData = parseSimpleCSVFormat(rows, debug);
    } else {
      parsedData = parseComplexCSVFormat(rows, debug);
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
    const enhancedData = enhanceTeacherData(parsedData, allEmails, teacherNames);
    
    if (debug) {
      console.log('Final parsed data:', enhancedData);
    }
    
    return enhancedData;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw new Error('Failed to parse CSV data. Please make sure your file is correctly formatted with the required columns.');
  }
};

/**
 * Parse CSV with simple format (standard headers)
 */
const parseSimpleCSVFormat = (rows: string[], debug = false): Record<string, string>[] => {
  const headers = parseCSVRow(rows[0]);
  
  if (debug) {
    console.log('Found headers:', headers);
  }
  
  // Process each data row
  return rows.slice(1)
    .filter(row => row.trim() !== '')
    .map(row => {
      const values = parseCSVRow(row);
      const rowData: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        if (header && index < values.length) {
          // Normalize header names directly
          const normalizedHeader = normalizeHeaderName(header);
          rowData[normalizedHeader] = values[index] || '';
        }
      });
      
      return rowData;
    });
};

/**
 * Parse CSV with complex format (non-standard headers or structure)
 */
const parseComplexCSVFormat = (rows: string[], debug = false): Record<string, string>[] => {
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
    headers = parseCSVRow(headerCandidate);
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
    normalizeHeaderName(header)
  );
  
  if (debug) {
    console.log('Normalized headers:', normalizedHeaders);
  }
  
  // Process rows into data
  if (headerRowIndex >= 0) {
    // Standard processing with found headers
    return rows.slice(headerRowIndex + 1)
      .filter(row => row.trim() !== '')
      .map(row => {
        const values = parseCSVRow(row);
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
    return rows.map((row) => {
      const values = parseCSVRow(row);
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
};
