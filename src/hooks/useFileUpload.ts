
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';

interface UseFileUploadOptions {
  onDataLoaded: (data: any[]) => void;
}

export const useFileUpload = ({ onDataLoaded }: UseFileUploadOptions) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const { toast } = useToast();

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
      
      const savedData = await excelService.saveTeacherData(parsedData);
      
      onDataLoaded(savedData);
      
      toast({
        title: 'File uploaded successfully',
        description: `Loaded ${savedData.length} teacher records.`,
      });
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
    handleUpload
  };
};
