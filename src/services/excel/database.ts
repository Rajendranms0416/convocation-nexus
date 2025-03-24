
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
    // Always save to local storage for offline capability first
    updateTeachersList(enhancedData);
    
    // Check if offline mode is preferred
    const preferOffline = localStorage.getItem('preferOfflineMode') === 'true';
    if (preferOffline) {
      console.log('Offline mode preferred, skipping database save');
      return enhancedData;
    }
    
    try {
      // Check database connection
      const { error: connectionError } = await supabase
        .from('teachers')
        .select('id', { count: 'exact', head: true });
      
      if (connectionError) {
        console.error('Database connection error, using local storage only:', connectionError);
        // Return the data saved to localStorage
        return enhancedData;
      }
      
      // Prepare data for database insertion - ensure all required fields are present
      const dbRecords = enhancedData.map(teacher => ({
        program_name: teacher['Programme Name'] || '',
        robe_email: teacher['Robe Email ID'] || '',
        folder_email: teacher['Folder Email ID'] || '',
        robe_in_charge: teacher['Accompanying Teacher'] || '',
        folder_in_charge: teacher['Folder in Charge'] || '',
        class_section: teacher['Class Wise/\nSection Wise'] || '',
        updated_at: new Date().toISOString()
      }));
      
      console.log(`Preparing to save ${dbRecords.length} records to database`);
      
      // Even smaller batch size with longer delay between batches
      const batchSize = 2;
      let successCount = 0;
      
      // For better observability, implement progress tracking
      let progress = 0;
      const totalBatches = Math.ceil(dbRecords.length / batchSize);
      
      for (let i = 0; i < dbRecords.length; i += batchSize) {
        const batch = dbRecords.slice(i, i + batchSize);
        progress++;
        console.log(`Saving batch ${progress}/${totalBatches} to database...`);
        
        try {
          // Use upsert with onConflict for program_name
          const { error } = await supabase
            .from('teachers')
            .upsert(batch, { 
              onConflict: 'program_name',
              ignoreDuplicates: false
            });
          
          if (error) {
            console.error(`Error saving batch ${i}-${i+batch.length} to database:`, error);
            throw error; // Propagate the error to trigger retry
          } else {
            successCount += batch.length;
            console.log(`Successfully saved batch ${progress}/${totalBatches}`);
          }
        } catch (batchError) {
          console.error(`Batch ${progress}/${totalBatches} failed, retrying with individual records:`, batchError);
          
          // If batch fails, try to save records individually
          for (const record of batch) {
            try {
              const { error: individualError } = await supabase
                .from('teachers')
                .upsert([record], { 
                  onConflict: 'program_name',
                  ignoreDuplicates: false
                });
              
              if (!individualError) {
                successCount++;
                console.log(`Successfully saved individual record for ${record.program_name}`);
              } else {
                console.error(`Failed to save individual record for ${record.program_name}:`, individualError);
              }
            } catch (individualSaveError) {
              console.error(`Exception saving individual record for ${record.program_name}:`, individualSaveError);
            }
            
            // Add a small delay between individual saves
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        // Larger delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log(`Saved ${successCount} out of ${dbRecords.length} records to database successfully`);
      
      // Notify any listeners that data has been updated
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
      
      return enhancedData;
    } catch (dbError) {
      console.error('Error saving to database, using local storage only:', dbError);
      // We already saved to localStorage, so just return the data
      return enhancedData;
    }
  } catch (error) {
    console.error('Error in saveTeacherData:', error);
    // Fall back to just local storage
    return enhancedData;
  }
};

/**
 * Get all teacher data from database, prioritizing Supabase over localStorage
 * @returns All teacher data
 */
export const getTeacherData = async (): Promise<Record<string, string>[]> => {
  console.log('Getting teacher data from database...');
  
  // Check if offline mode is preferred
  const preferOffline = localStorage.getItem('preferOfflineMode') === 'true';
  if (preferOffline) {
    console.log('Offline mode preferred, getting data from local storage only');
    return getAllTeachers();
  }
  
  try {
    // First check if database is available
    const { data: statusCheck, error: statusError } = await supabase
      .from('teachers')
      .select('count(*)', { count: 'exact', head: true });
      
    if (statusError) {
      console.error('Database connection error:', statusError);
      throw statusError;
    }
    
    // Try to get from database first
    const { data, error } = await supabase.from('teachers').select('*');
    
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    
    if (data && data.length > 0) {
      console.log(`Retrieved ${data.length} records from Supabase`, data);
      
      // Map database fields back to the expected format
      const formattedData = data.map(record => ({
        id: record.id, // Include the database ID
        'Programme Name': record.program_name || '',
        'Robe Email ID': record.robe_email || '',
        'Folder Email ID': record.folder_email || '',
        'Accompanying Teacher': record.robe_in_charge || '',
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

// Export the updateTeachersList so it's available through the excelService
export { updateTeachersList, getAllTeachers };
