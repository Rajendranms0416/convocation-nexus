
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { updateTeachersList } from '@/utils/authHelpers'; // Import directly from authHelpers

interface UseFileUploadOptions {
  onDataLoaded: (data: any[]) => void;
}

export const useFileUpload = ({ onDataLoaded }: UseFileUploadOptions) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const { toast } = useToast();
  const { isConnected, checkConnection } = useDatabaseConnection();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setUploadError(`Invalid file type. Please select a CSV or Excel file (${validExtensions.join(', ')})`);
        setFile(null);
        setFileInfo(null);
        return;
      }
      
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
      // Check database connection before proceeding
      const dbConnected = await checkConnection();
      
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
      
      excelService.validateTeacherData(parsedData);
      
      let savedData;
      
      if (dbConnected) {
        try {
          // Try to save to database
          savedData = await excelService.saveTeacherData(parsedData);
          toast({
            title: 'File uploaded successfully to database',
            description: `Loaded ${savedData.length} teacher records.`,
          });
        } catch (dbError) {
          console.error('Database save failed, falling back to local storage:', dbError);
          // Fall back to local storage
          savedData = excelService.enhanceTeacherData(parsedData);
          // Save to localStorage via updateTeachersList imported directly
          updateTeachersList(savedData);
          
          toast({
            title: 'Saved to local storage (database unavailable)',
            description: `Loaded ${savedData.length} teacher records to local storage.`,
            variant: 'default',
          });
        }
      } else {
        // If database is not connected, use local storage directly
        savedData = excelService.enhanceTeacherData(parsedData);
        // Save to localStorage via updateTeachersList imported directly
        updateTeachersList(savedData);
        
        toast({
          title: 'Saved to local storage (database unavailable)',
          description: `Loaded ${savedData.length} teacher records to local storage.`,
          variant: 'default',
        });
      }
      
      onDataLoaded(savedData);
      
      // Notify any listeners that data has been updated
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      
      toast({
        title: 'Failed to upload file',
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
    isUploading,
    uploadError,
    handleFileChange,
    handleUpload,
    isDbConnected: isConnected
  };
};
