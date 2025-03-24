
import React from 'react';
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
  
  const { 
    file, 
    fileInfo, 
    sessionInfo,
    isUploading, 
    uploadError, 
    handleFileChange, 
    handleUpload
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
        fileName={sessionInfo}
      />
      
      {useOfflineStorage && (
        <Alert variant="warning" className="mt-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            The file will be processed and saved to local storage only.
          </AlertDescription>
        </Alert>
      )}
      
      <FileInfo info={fileInfo} />
      
      <FileError error={uploadError || ''} />
    </>
  );
};

export default FileUploader;
