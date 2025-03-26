
import { supabase, callFunction, queryDynamicTable } from '@/integrations/supabase/client';
import { DynamicTableRow, DynamicTableInsert } from '@/integrations/supabase/custom-types';

/**
 * Create a dynamic table in the database
 * @param tableName The name of the table to create
 * @returns Result of the create_upload_table function call
 */
export const createDynamicTable = async (tableName: string) => {
  try {
    return await callFunction('create_upload_table', { table_name: tableName });
  } catch (error) {
    console.error('Error creating dynamic table:', error);
    return { error };
  }
};

/**
 * Insert data into a dynamic table
 * @param tableName The name of the table to insert into
 * @param data The data to insert
 * @returns Result of the insert operation
 */
export const insertIntoDynamicTable = async (tableName: string, data: DynamicTableInsert[]) => {
  try {
    return await queryDynamicTable(tableName).insert(data);
  } catch (error) {
    console.error('Error inserting data into dynamic table:', error);
    return { error };
  }
};

/**
 * Create a record in the file_uploads table
 * @param filename The original file name
 * @param tableName The name of the created table
 * @param sessionInfo Information about the upload session
 * @param recordCount Number of records in the file
 * @returns Result of the insert operation
 */
export const createFileUploadRecord = async (
  filename: string,
  tableName: string,
  sessionInfo: string,
  recordCount: number
) => {
  try {
    return await supabase
      .from('file_uploads')
      .insert({
        filename: filename,
        table_name: tableName,
        session_info: sessionInfo,
        record_count: recordCount
      })
      .select();
  } catch (error) {
    console.error('Error creating file upload record:', error);
    return { error };
  }
};
