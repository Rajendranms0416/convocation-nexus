import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { excelService } from '@/services/excel';
import { supabase } from '@/integrations/supabase/client';

interface FileUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
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

  const exportCurrentData = async () => {
    try {
      const { data: teachersData, error } = await supabase
        .from('teachers')
        .select('*');
        
      if (error) throw error;
      
      const formattedData = teachersData.map(teacher => ({
        'Programme Name': teacher.program_name,
        'Robe Email ID': teacher.robe_email,
        'Folder Email ID': teacher.folder_email,
        'Accompanying Teacher': teacher.robe_in_charge,
        'Folder in Charge': teacher.folder_in_charge,
        'Class Wise/\nSection Wise': teacher.class_section
      }));
      
      const csvContent = excelService.generateCSV(formattedData);
      
      if (!csvContent) {
        toast({
          title: 'No data to export',
          description: 'There are no teacher records currently loaded.',
          variant: 'destructive',
        });
        return;
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'teachers_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data exported successfully',
        description: `Exported teacher records.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Failed to export data',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileChange}
          className="flex-1"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="flex-1 sm:flex-none"
          >
            {isUploading ? 'Uploading...' : 'Upload'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={exportCurrentData}
            className="flex-1 sm:flex-none"
          >
            Export
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {fileInfo && (
        <p className="text-xs text-muted-foreground">{fileInfo}</p>
      )}
      
      {uploadError && (
        <Alert variant="destructive" className="mt-3">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FileUploader;
