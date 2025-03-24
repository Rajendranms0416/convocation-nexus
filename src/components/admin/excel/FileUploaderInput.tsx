
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Download } from 'lucide-react';
import OfflineModeToggle from './OfflineModeToggle';

interface FileUploaderInputProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onExport: () => void;
  isUploading: boolean;
  isExporting: boolean;
  hasFile: boolean;
}

const FileUploaderInput: React.FC<FileUploaderInputProps> = ({
  onFileChange,
  onUpload,
  onExport,
  isUploading,
  isExporting,
  hasFile
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileChange}
          className="flex-1"
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={onUpload} 
            disabled={!hasFile || isUploading}
            className="flex-1 sm:flex-none"
          >
            {isUploading ? 'Processing...' : 'Process File'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={onExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none"
          >
            {isExporting ? 'Exporting...' : 'Export'}
            <Download className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-end">
        <OfflineModeToggle />
      </div>
    </div>
  );
};

export default FileUploaderInput;
