
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';
import { createDynamicTable, createFileUploadRecord, insertIntoDynamicTable } from '@/utils/dynamicTableHelpers';
import { DynamicTableInsert } from '@/integrations/supabase/custom-types';

interface UseFileUploadOptions {
  onDataLoaded: (data: any[], sessionInfo: string, tableId?: string) => void;
}

export const useFileUpload = ({ onDataLoaded }: UseFileUploadOptions) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string>('');
  const { toast } = useToast();

  const parseSessionInfo = (filename: string): string => {
    let session = "April 22, 2023 - Morning (09:00 AM)";
    
    try {
      const dateMatch = filename.match(/(\d{1,2})[-_](\d{1,2})[-_](\d{4})/);
      const timeMatch = filename.match(/morning|evening|afternoon/i);
      
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[parseInt(month) - 1] || "April";
        
        const timeOfDay = timeMatch 
          ? timeMatch[0].charAt(0).toUpperCase() + timeMatch[0].slice(1).toLowerCase() 
          : "Morning";
        
        const startTime = timeOfDay === "Morning" ? "09:00 AM" 
                        : timeOfDay === "Afternoon" ? "01:00 PM" 
                        : "05:00 PM";
        
        session = `${monthName} ${day}, ${year} - ${timeOfDay} (${startTime})`;
      }
    } catch (error) {
      console.error("Error parsing session info:", error);
    }
    
    return session;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setUploadError(`Invalid file type. Please select a CSV or Excel file (${validExtensions.join(', ')})`);
        setFile(null);
        setFileInfo(null);
        setSessionInfo('');
        return;
      }
      
      setSessionInfo(parseSessionInfo(selectedFile.name));
      
      setFile(selectedFile);
      setUploadError(null);
      setFileInfo(`Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      let parsedData;
      
      if (fileExtension === '.csv') {
        const fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              resolve(e.target.result);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('Error reading file'));
          reader.readAsText(file);
        });
        
        parsedData = excelService.parseCSV(fileContent, true);
      } else {
        const fileBuffer = await file.arrayBuffer();
        parsedData = await excelService.parseExcel(fileBuffer);
      }
      
      console.log('Parsed data:', parsedData);
      
      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in the file');
      }
      
      const safeTableName = `upload_${new Date().getTime()}`;
      
      try {
        const { error: createTableError } = await createDynamicTable(safeTableName);
        
        if (createTableError) {
          console.error('Error creating table:', createTableError);
          throw new Error(`Failed to create table: ${createTableError.message}`);
        }
        
        const uploadRecordResult = await createFileUploadRecord(
          file.name,
          safeTableName,
          sessionInfo,
          parsedData.length
        );
        
        if (uploadRecordResult.error) {
          console.error('Error recording upload:', uploadRecordResult.error);
          throw new Error(`Failed to record upload: ${uploadRecordResult.error.message}`);
        }
        
        // Safe access to data property with type checking
        const uploadRecordId = uploadRecordResult.error ? null : 
                              uploadRecordResult.data && uploadRecordResult.data.length > 0 ? 
                              uploadRecordResult.data[0].id : null;
        
        const formattedData = parsedData.map((item: any) => ({
          "Programme_Name": item["Programme Name"] || '',
          "Robe_Email_ID": item["Robe Email ID"] || '',
          "Folder_Email_ID": item["Folder Email ID"] || '',
          "Accompanying_Teacher": item["Accompanying Teacher"] || '',
          "Folder_in_Charge": item["Folder in Charge"] || '',
          "Class_Section": item["Class Wise/\nSection Wise"] || ''
        })) as DynamicTableInsert[];
        
        const batchSize = 100;
        for (let i = 0; i < formattedData.length; i += batchSize) {
          const batch = formattedData.slice(i, i + batchSize);
          const { error: insertError } = await insertIntoDynamicTable(safeTableName, batch);
          
          if (insertError) {
            console.error(`Error inserting batch ${i}:`, insertError);
          }
        }
        
        excelService.saveTeacherData(parsedData, sessionInfo, safeTableName);
        
        toast({
          title: 'File processed successfully',
          description: `Created database "${sessionInfo}" with ${parsedData.length} records.`,
          variant: 'default',
        });
        
        onDataLoaded(parsedData, sessionInfo, uploadRecordId?.toString());
        
        window.dispatchEvent(new CustomEvent('teacherDataUpdated', { 
          detail: { session: sessionInfo, tableId: uploadRecordId?.toString() } 
        }));
      } catch (error) {
        console.error('Database operation error:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      
      toast({
        title: 'Failed to process file',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    file,
    fileInfo,
    sessionInfo,
    isUploading,
    uploadError,
    handleFileChange,
    handleUpload
  };
};
