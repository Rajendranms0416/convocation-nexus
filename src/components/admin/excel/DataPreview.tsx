
import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataPreviewProps {
  previewData: any[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ previewData }) => {
  if (previewData.length === 0) return null;
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Preview (First 5 entries):</h3>
      <div className="border rounded-md overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead className="p-2 text-left text-xs">Programme</TableHead>
              <TableHead className="p-2 text-left text-xs">Robe Email</TableHead>
              <TableHead className="p-2 text-left text-xs">Folder Email</TableHead>
              <TableHead className="p-2 text-left text-xs">Robe Teacher</TableHead>
              <TableHead className="p-2 text-left text-xs">Folder Teacher</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewData.map((row, index) => (
              <TableRow key={index} className="border-t">
                <TableCell className="p-2 text-xs">{row['Programme Name'] || '-'}</TableCell>
                <TableCell className="p-2 text-xs">{row['Robe Email ID'] || '-'}</TableCell>
                <TableCell className="p-2 text-xs">{row['Folder Email ID'] || '-'}</TableCell>
                <TableCell className="p-2 text-xs">{row['Accompanying Teacher'] || '-'}</TableCell>
                <TableCell className="p-2 text-xs">{row['Folder in Charge'] || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataPreview;
