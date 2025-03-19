
/**
 * Excel Service - Data manipulation functionality
 */
import { updateTeachersList, getAllTeachers } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Enhance teacher data by searching sheet-wide for needed information
 * @param data Initial teacher data
 * @param additionalEmails Optional list of all emails found in the sheet
 * @param teacherNames Optional list of all potential teacher names found in the sheet
 * @returns Enhanced data with required columns filled
 */
export const enhanceTeacherData = (data: Record<string, string>[], additionalEmails: string[] = [], teacherNames: string[] = []): Record<string, string>[] => {
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
  
  // Get unique teacher names and emails (avoid duplicating the same teacher)
  const uniqueTeacherNames = [...new Set(allTeacherNames)].filter(name => 
    name && name.length > 2 && !/sl\.?\s*no|class wise/i.test(name)
  );
  const uniqueEmails = [...new Set(allEmails)].filter(email => email);
  
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
    
    // Ensure Folder Email ID - Make sure this field is properly populated
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
    
    // Ensure Folder in Charge name - Improve this section to better identify folder teachers
    if (!enhancedRow['Folder in Charge'] || 
        enhancedRow['Folder in Charge'].trim() === '' || 
        enhancedRow['Folder in Charge'] === '"Class Wise/' ||
        /class\s*wise/i.test(enhancedRow['Folder in Charge'])) {
      // Try to find any key that might contain a folder in charge name
      const folderTeacherKey = Object.keys(row).find(key => 
        (key.toLowerCase().includes('folder') && key.toLowerCase().includes('charge')) ||
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
};

/**
 * Save data to localStorage and the database
 * @param data The data to save
 * @returns The saved data
 */
export const saveTeacherData = async (data: Record<string, string>[]): Promise<Record<string, string>[]> => {
  // First enhance the data one final time
  const enhancedData = enhanceTeacherData(data);
  console.log('Final data to save:', enhancedData);
  
  try {
    // Save to local storage for backward compatibility
    updateTeachersList(enhancedData);
    
    // Clear existing data in the database
    await supabase.from('teachers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Prepare data for database insertion
    const dbRecords = enhancedData.map(teacher => ({
      program_name: teacher['Programme Name'] || '',
      robe_email: teacher['Robe Email ID'] || '',
      folder_email: teacher['Folder Email ID'] || '',
      accompanying_teacher: teacher['Accompanying Teacher'] || '',
      folder_in_charge: teacher['Folder in Charge'] || '',
      class_section: teacher['Class Wise/\nSection Wise'] || '',
    }));
    
    // Insert into database
    const { error } = await supabase.from('teachers').insert(dbRecords);
    
    if (error) {
      console.error('Error saving to database:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('Saved to database successfully');
    
    // Notify any listeners that data has been updated
    window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
    
    return enhancedData;
  } catch (error) {
    console.error('Error in saveTeacherData:', error);
    // Fall back to just local storage
    return updateTeachersList(enhancedData);
  }
};

/**
 * Get all teacher data from database or fallback to localStorage
 * @returns All teacher data
 */
export const getTeacherData = async (): Promise<Record<string, string>[]> => {
  try {
    // Try to get from database first
    const { data, error } = await supabase.from('teachers').select('*');
    
    if (error) {
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Retrieved data from database:', data);
      
      // Map database fields back to the expected format
      return data.map(record => ({
        id: record.id, // Include the database ID
        'Programme Name': record.program_name || '',
        'Robe Email ID': record.robe_email || '',
        'Folder Email ID': record.folder_email || '',
        'Accompanying Teacher': record.accompanying_teacher || '',
        'Folder in Charge': record.folder_in_charge || '',
        'Class Wise/\nSection Wise': record.class_section || '',
      }));
    }
    
    // Fallback to localStorage if no data in database
    return getAllTeachers();
  } catch (error) {
    console.error('Error fetching from database:', error);
    // Fallback to localStorage
    return getAllTeachers();
  }
};

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
