
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
    const { error: deleteError } = await supabase.from('teachers').delete().not('id', 'is', null);
    
    if (deleteError) {
      console.error('Error clearing existing data:', deleteError);
      throw new Error(`Database error during delete: ${deleteError.message}`);
    }
    
    // Prepare data for database insertion - ensure all required fields are present
    const dbRecords = enhancedData.map(teacher => ({
      program_name: teacher['Programme Name'] || '',
      robe_email: teacher['Robe Email ID'] || '',
      folder_email: teacher['Folder Email ID'] || '',
      accompanying_teacher: teacher['Accompanying Teacher'] || '',
      folder_in_charge: teacher['Folder in Charge'] || '',
      class_section: teacher['Class Wise/\nSection Wise'] || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    // Insert data in batches of 100 to avoid payload size issues
    const batchSize = 100;
    for (let i = 0; i < dbRecords.length; i += batchSize) {
      const batch = dbRecords.slice(i, i + batchSize);
      const { error } = await supabase.from('teachers').insert(batch);
      
      if (error) {
        console.error(`Error saving batch ${i}-${i+batch.length} to database:`, error);
        throw new Error(`Database error during insert: ${error.message}`);
      }
    }
    
    console.log(`Saved ${dbRecords.length} records to database successfully`);
    
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
      console.log(`Retrieved ${data.length} records from Supabase`);
      
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
