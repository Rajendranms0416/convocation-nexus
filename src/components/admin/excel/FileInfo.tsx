
import React from 'react';

interface FileInfoProps {
  info: string | null;
}

const FileInfo: React.FC<FileInfoProps> = ({ info }) => {
  if (!info) return null;
  
  return (
    <p className="text-xs text-muted-foreground">{info}</p>
  );
};

export default FileInfo;
