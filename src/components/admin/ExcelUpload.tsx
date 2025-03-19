
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';
import FileUploader from './excel/FileUploader';
import FormatHelp from './excel/FormatHelp';
import DataPreview from './excel/DataPreview';

// Define the expected column structure
const requiredColumns = [
  'Programme Name',
  'Robe Email ID',
  'Folder Email ID',
  'Accompanying Teacher',
  'Folder in Charge'
];

const ExcelUpload: React.FC = () => {
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const handleDataLoaded = (data: any[]) => {
    setPreviewData(data);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Import Teacher Data</CardTitle>
        <CardDescription>
          Upload a CSV file with teacher information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUploader onDataLoaded={handleDataLoaded} />
        
        <FormatHelp 
          showHelp={showHelp} 
          setShowHelp={setShowHelp} 
          requiredColumns={requiredColumns} 
        />
        
        <DataPreview previewData={previewData} />
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3 w-3 mr-1" /> 
        CSV columns needed: Programme Name, Robe Email ID, Folder Email ID
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
