/**
 * Excel Service - Database operations for teacher data
 */
import { supabase } from '@/integrations/supabase/client';
import { updateTeachersList, getAllTeachers } from '@/utils/authHelpers';
import { enhanceTeacherData } from './enhance';

/**
 * Save data to both Supabase database and localStorage for offline capability
 * @param data The data to save
 * @returns The saved data
 */
export const saveTeacherData = async (data: Record<string, string>[]): Promise<Record<string, string>[]> => {
  // First enhance the data one final time
  const enhancedData = enhanceTeacherData(data);
  console.log('Final data to save:', enhancedData);
  
  try {
    // Save to local storage for offline capability
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
 * Get all teacher data from database, prioritizing Supabase over localStorage
 * @returns All teacher data
 */
export const getTeacherData = async (): Promise<Record<string, string>[]> => {
  console.log('Getting teacher data from database...');
  
  try {
    // Try to get from database first
    const { data, error } = await supabase.from('teachers').select('*');
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log('Retrieved data from Supabase:', data);
      
      // Map database fields back to the expected format
      const formattedData = data.map(record => ({
        id: record.id, // Include the database ID
        'Programme Name': record.program_name || '',
        'Robe Email ID': record.robe_email || '',
        'Folder Email ID': record.folder_email || '',
        'Accompanying Teacher': record.accompanying_teacher || '',
        'Folder in Charge': record.folder_in_charge || '',
        'Class Wise/\nSection Wise': record.class_section || '',
      }));
      
      // Also update localStorage to keep offline capability
      updateTeachersList(formattedData);
      
      return formattedData;
    }
    
    // No data in Supabase, fallback to localStorage
    console.log('No data in Supabase, using localStorage');
    return getAllTeachers();
  } catch (error) {
    console.error('Error fetching from database:', error);
    // Fallback to localStorage
    return getAllTeachers();
  }
};
