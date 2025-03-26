
import { queryDynamicTable, supabase, callFunction } from '@/integrations/supabase/client';
import { DynamicTableRow, DynamicTableInsert, TeachersInsert, TeachersUpdate } from '@/integrations/supabase/custom-types';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Helper function to safely insert data into a dynamic table
 */
export const insertIntoDynamicTable = async (
  tableName: string, 
  data: DynamicTableInsert | DynamicTableInsert[]
): Promise<{ data: DynamicTableRow[] | null, error: PostgrestError | null }> => {
  try {
    const isArray = Array.isArray(data);
    const dataToInsert = isArray ? data : [data];
    
    // Use the queryDynamicTable helper which handles the type casting
    const result = await queryDynamicTable(tableName as any)
      .insert(dataToInsert as any)
      .select();
      
    return { 
      data: result.data as unknown as DynamicTableRow[] | null, 
      error: result.error 
    };
  } catch (error) {
    console.error(`Error inserting into ${tableName}:`, error);
    return { 
      data: null, 
      error: error as PostgrestError 
    };
  }
};

/**
 * Helper function to safely update data in a dynamic table
 */
export const updateDynamicTable = async (
  tableName: string,
  data: DynamicTableInsert,
  id: number
): Promise<{ data: DynamicTableRow[] | null, error: PostgrestError | null }> => {
  try {
    // Use the queryDynamicTable helper which handles the type casting
    const result = await queryDynamicTable(tableName as any)
      .update(data as any)
      .eq('id', id)
      .select();
      
    return { 
      data: result.data as unknown as DynamicTableRow[] | null, 
      error: result.error 
    };
  } catch (error) {
    console.error(`Error updating ${tableName}:`, error);
    return { 
      data: null, 
      error: error as PostgrestError 
    };
  }
};

/**
 * Helper function to safely insert data into the teachers table
 */
export const insertIntoTeachersTable = async (
  data: TeachersInsert | TeachersInsert[]
): Promise<{ data: any[] | null, error: PostgrestError | null }> => {
  try {
    const isArray = Array.isArray(data);
    const dataToInsert = isArray ? data : [data];
    
    const result = await supabase
      .from('teachers')
      .insert(dataToInsert)
      .select();
      
    return { 
      data: result.data, 
      error: result.error 
    };
  } catch (error) {
    console.error('Error inserting into teachers table:', error);
    return { 
      data: null, 
      error: error as PostgrestError 
    };
  }
};

/**
 * Helper function to safely update data in the teachers table
 */
export const updateTeachersTable = async (
  data: TeachersUpdate,
  id: number
): Promise<{ data: any[] | null, error: PostgrestError | null }> => {
  try {
    const result = await supabase
      .from('teachers')
      .update(data)
      .eq('id', id)
      .select();
      
    return { 
      data: result.data, 
      error: result.error 
    };
  } catch (error) {
    console.error('Error updating teachers table:', error);
    return { 
      data: null, 
      error: error as PostgrestError 
    };
  }
};

/**
 * Helper function to create a new dynamic table
 */
export const createDynamicTable = async (tableName: string): Promise<{ error: PostgrestError | null }> => {
  try {
    const { error } = await callFunction('create_upload_table' as any, tableName);
    return { error };
  } catch (error) {
    console.error('Error creating dynamic table:', error);
    return { error: error as PostgrestError };
  }
};

/**
 * Helper function to create a file upload record
 */
export const createFileUploadRecord = async (
  filename: string,
  tableName: string,
  sessionInfo: string,
  recordCount?: number
): Promise<{ data: any | null, error: PostgrestError | null }> => {
  try {
    const { data, error } = await supabase
      .from('file_uploads')
      .insert({
        filename,
        table_name: tableName,
        session_info: sessionInfo,
        record_count: recordCount || 0,
        upload_date: new Date().toISOString()
      })
      .select()
      .single();
      
    return { data, error };
  } catch (error) {
    console.error('Error creating file upload record:', error);
    return { 
      data: null, 
      error: error as PostgrestError 
    };
  }
};
