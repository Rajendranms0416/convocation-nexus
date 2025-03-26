
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import * as XLSX from 'xlsx';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [tableInfo, setTableInfo] = useState<{ tableName: string, id: number } | null>(null);

  /**
   * Parses an Excel file and extracts data
   */
  const parseExcelFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (err) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  /**
   * Creates a dynamic table in Supabase to store the uploaded data
   */
  const createDynamicTable = async (tableName: string) => {
    try {
      // Use Supabase's stored procedure to create a new table
      const { error } = await supabase.rpc('create_upload_table', { table_name: tableName });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error('Error creating dynamic table:', err);
      throw new Error('Failed to create table in database');
    }
  };

  /**
   * Uploads data to the dynamic table
   */
  const uploadDataToTable = async (tableName: string, data: any[]) => {
    try {
      // Transform data to match table schema
      const transformedData = data.map(item => ({
        Programme_Name: item['Programme Name'] || '',
        Robe_Email_ID: item['Robe Email ID'] || '',
        Folder_Email_ID: item['Folder Email ID'] || '',
        Accompanying_Teacher: item['Accompanying Teacher'] || '',
        Folder_in_Charge: item['Folder in Charge'] || '',
        Class_Section: item['Class Wise/Section Wise'] || '',
      }));
      
      // Insert the data into the newly created table
      const { error } = await supabase.from(tableName).insert(transformedData);
      
      if (error) throw error;
      
      return { success: true, count: transformedData.length };
    } catch (err) {
      console.error('Error uploading data to table:', err);
      throw new Error('Failed to upload data to database');
    }
  };

  /**
   * Records the file upload in the file_uploads table
   */
  const recordFileUpload = async (
    fileName: string, 
    tableName: string, 
    recordCount: number,
    sessionInfo: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .insert([
          { 
            filename: fileName,
            table_name: tableName,
            record_count: recordCount,
            session_info: sessionInfo
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Handle response safely by checking for data presence
      if (data && data.length > 0) {
        return { id: data[0].id, tableName: data[0].table_name };
      } else {
        throw new Error('No data returned from file upload record');
      }
    } catch (err) {
      console.error('Error recording file upload:', err);
      throw new Error('Failed to record file upload');
    }
  };

  /**
   * Main function to handle file uploads
   */
  const uploadFile = async (file: File, sessionInfo: string) => {
    setIsUploading(true);
    setError(null);
    setFileName(file.name);
    setFileUploaded(false);
    setTableInfo(null);
    
    try {
      // 1. Parse the Excel file
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      
      if (parsedData.length === 0) {
        throw new Error('No data found in Excel file');
      }
      
      // 2. Create a unique table name for this upload
      const timestamp = Date.now();
      const tableName = `upload_${timestamp}`;
      
      // 3. Create a new table in Supabase
      await createDynamicTable(tableName);
      
      // 4. Upload the data to the new table
      const { count } = await uploadDataToTable(tableName, parsedData);
      
      // 5. Record the file upload
      const { id } = await recordFileUpload(file.name, tableName, count, sessionInfo);
      
      // 6. Update component state
      setTableInfo({ tableName, id });
      setFileUploaded(true);
      
      toast({
        title: 'File uploaded successfully',
        description: `${count} records uploaded to database`,
      });
      
      return { tableName, id, data: parsedData, sessionInfo };
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: 'File upload failed',
        description: err instanceof Error ? err.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
    fileName,
    data,
    fileUploaded,
    tableInfo
  };
};
