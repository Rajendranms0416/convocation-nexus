
import React from 'react';
import FileUploaderInput from './FileUploaderInput';
import FileInfo from './FileInfo';
import FileError from './FileError';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDataExport } from '@/hooks/useDataExport';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FileUploaderProps {
  onDataLoaded: (data: any[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const { 
    file, 
    fileInfo, 
    isUploading, 
    uploadError, 
    handleFileChange, 
    handleUpload,
    isDbConnected
  } = useFileUpload({ onDataLoaded });
  
  const { isExporting, exportCurrentData } = useDataExport();

  return (
    <>
      <FileUploaderInput
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        onExport={exportCurrentData}
        isUploading={isUploading}
        isExporting={isExporting}
        hasFile={!!file}
      />
      
      {isDbConnected === false && (
        <Alert variant="warning" className="mt-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Database connection is unavailable. Files will be saved to local storage only.
          </AlertDescription>
        </Alert>
      )}
      
      <FileInfo info={fileInfo} />
      
      <FileError error={uploadError || ''} />
    </>
  );
};

export default FileUploader;
