
import React, { useState } from 'react';
import FileUploaderInput from './FileUploaderInput';
import FileInfo from './FileInfo';
import FileError from './FileError';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDataExport } from '@/hooks/useDataExport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useOfflineMode } from '@/hooks/useOfflineMode';

interface FileUploaderProps {
  onDataLoaded: (data: any[], sessionInfo: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const { useOfflineStorage } = useOfflineMode();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionInfo, setSessionInfo] = useState<string>('');
  
  const { 
    uploadFile,
    isUploading,
    error,
    fileName,
    data,
    fileUploaded
  } = useFileUpload();
  
  const { exportToExcel, isExporting } = useDataExport();
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      // Set a default session info from the filename
      const file = e.target.files[0];
      const sessionName = file.name.replace(/\.[^/.]+$/, ""); // Remove file extension
      setSessionInfo(sessionName);
    }
  };
  
  // Handle upload button click
  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    try {
      const result = await uploadFile(uploadedFile, sessionInfo);
      if (result) {
        onDataLoaded(result.data, result.sessionInfo);
      }
    } catch (err) {
      console.error('Error during file upload:', err);
    }
  };
  
  // Create a wrapper function to handle export with current session info
  const handleExport = () => {
    if (sessionInfo) {
      exportToExcel(sessionInfo, `Teachers_${sessionInfo.replace(/[^a-zA-Z0-9]/g, '_')}`);
    }
  };

  return (
    <>
      <FileUploaderInput
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        onExport={handleExport}
        isUploading={isUploading}
        isExporting={isExporting}
        hasFile={!!uploadedFile}
        fileName={sessionInfo}
      />
      
      {useOfflineStorage && (
        <Alert variant="warning" className="mt-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The file will be processed locally. No database operations will be performed.
          </AlertDescription>
        </Alert>
      )}
      
      <FileInfo info={fileName ? `File: ${fileName}` : null} />
      
      <FileError error={error || ''} />
    </>
  );
};

export default FileUploader;
