
import { useState } from 'react';
import { toast } from './use-toast';
import * as XLSX from 'xlsx';
import { updateTeachersList } from '@/utils/authHelpers';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [data, setData] = useState<any[] | null>(null);
  const [fileUploaded, setFileUploaded] = useState(false);

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
   * Main function to handle file uploads - simplified to skip database operations
   */
  const uploadFile = async (file: File, sessionInfo: string) => {
    setIsUploading(true);
    setError(null);
    setFileName(file.name);
    setFileUploaded(false);
    
    try {
      // 1. Parse the Excel file
      const parsedData = await parseExcelFile(file);
      setData(parsedData);
      
      if (parsedData.length === 0) {
        throw new Error('No data found in Excel file');
      }
      
      // Transform the data for consistency with our expected format
      const transformedData = parsedData.map((item, index) => ({
        ...item,
        id: index + 1,
        Programme_Name: item['Programme Name'] || '',
        Robe_Email_ID: item['Robe Email ID'] || '',
        Folder_Email_ID: item['Folder Email ID'] || '',
        Accompanying_Teacher: item['Accompanying Teacher'] || '',
        Folder_in_Charge: item['Folder in Charge'] || '',
        Class_Section: item['Class Wise/Section Wise'] || '',
      }));
      
      // Save transformed data to localStorage with session info
      updateTeachersList(transformedData, sessionInfo);
      
      setFileUploaded(true);
      
      toast({
        title: 'File processed successfully',
        description: `${transformedData.length} records loaded from file`,
      });
      
      // Fire event to notify that teacher data has been updated
      const customEvent = new CustomEvent('teacherDataUpdated', {
        detail: { session: sessionInfo }
      });
      window.dispatchEvent(customEvent);
      
      return { data: transformedData, sessionInfo };
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: 'File processing failed',
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
    fileUploaded
  };
};
