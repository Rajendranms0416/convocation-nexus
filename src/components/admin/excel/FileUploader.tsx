
import React from 'react';
import FileUploaderInput from './FileUploaderInput';
import FileInfo from './FileInfo';
import FileError from './FileError';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useDataExport } from '@/hooks/useDataExport';

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
      />
      
      <FileInfo info={fileInfo} />
      
      <FileError error={uploadError || ''} />
    </>
  );
};

export default FileUploader;
