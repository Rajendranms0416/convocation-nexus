
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';

interface UseFileUploadOptions {
  onDataLoaded: (data: any[], sessionInfo: string) => void;
}

export const useFileUpload = ({ onDataLoaded }: UseFileUploadOptions) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string>('');
  const { toast } = useToast();

  // Function to parse session info from filename
  const parseSessionInfo = (filename: string): string => {
    // Default session if we can't extract anything
    let session = "April 22, 2023 - Morning (09:00 AM)";
    
    try {
      // Try to extract date and time from filename
      // Expected format: something_DD-MM-YYYY_Morning.xlsx or similar
      const dateMatch = filename.match(/(\d{1,2})[-_](\d{1,2})[-_](\d{4})/);
      const timeMatch = filename.match(/morning|evening|afternoon/i);
      
      if (dateMatch) {
        const day = dateMatch[1];
        const month = dateMatch[2];
        const year = dateMatch[3];
        
        // Convert month number to name
        const monthNames = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"];
        const monthName = monthNames[parseInt(month) - 1] || "April";
        
        // Default time is morning if not specified
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
      
      // Parse session info from filename
      const extractedSession = parseSessionInfo(selectedFile.name);
      setSessionInfo(extractedSession);
      
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
      
      // Minimal validation - just check if there's data
      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in the file');
      }
      
      // Save the data to localStorage with the session info
      excelService.saveTeacherData(parsedData, sessionInfo);
      
      toast({
        title: 'File processed successfully',
        description: `Loaded ${parsedData.length} records for ${sessionInfo}.`,
        variant: 'default',
      });
      
      onDataLoaded(parsedData, sessionInfo);
      
      // Notify any listeners that data has been updated
      window.dispatchEvent(new CustomEvent('teacherDataUpdated', { 
        detail: { session: sessionInfo } 
      }));
      
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
