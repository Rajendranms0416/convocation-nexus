
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Download, Database, RefreshCw } from 'lucide-react';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import OfflineModeToggle from './OfflineModeToggle';
import { useOfflineMode } from '@/hooks/useOfflineMode';

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
  const { isConnected, isChecking, checkConnection } = useDatabaseConnection();
  const { useOfflineStorage } = useOfflineMode();
  
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
            {isUploading ? 'Uploading...' : 'Upload'}
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
      
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center text-xs text-muted-foreground">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1 h-auto"
                  onClick={checkConnection}
                  disabled={isChecking || useOfflineStorage}
                >
                  {isChecking ? (
                    <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Database className={`h-3.5 w-3.5 mr-1 ${isConnected && !useOfflineStorage ? 'text-green-500' : 'text-red-500'}`} />
                  )}
                </Button>
                <span>
                  {isChecking 
                    ? 'Checking database connection...' 
                    : useOfflineStorage
                      ? 'Using offline mode (local storage only)'
                      : isConnected 
                        ? 'Database connected' 
                        : 'Database not connected - fallback to local storage enabled'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Click to check database connection</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <OfflineModeToggle />
      </div>
    </div>
  );
};

export default FileUploaderInput;
