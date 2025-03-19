
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './excel/FileUploader';
import FormatHelp from './excel/FormatHelp';
import DataPreview from './excel/DataPreview';
import excelService from '@/services/excelService';

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
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { toast } = useToast();

  const handleDataLoaded = (data: any[]) => {
    // Check if there's any data
    if (!data || data.length === 0) {
      setHasErrors(true);
      setErrorMessage('No data found in the CSV file.');
      setPreviewData([]);
      return;
    }
    
    try {
      // Validate that required columns are present
      const firstRow = data[0];
      const missingColumns = requiredColumns.filter(
        col => !Object.keys(firstRow).includes(col)
      );
      
      if (missingColumns.length > 0) {
        toast({
          title: "Missing columns",
          description: `These columns are missing: ${missingColumns.join(', ')}`,
          variant: "destructive"
        });
        // Still show data with warnings
        setHasErrors(true);
        setErrorMessage(`Missing columns: ${missingColumns.join(', ')}`);
      } else {
        setHasErrors(false);
        setErrorMessage('');
      }
      
      // Check for potential duplicate data (first row being duplicated)
      const uniquePrograms = new Set(data.map(row => row['Programme Name']));
      if (uniquePrograms.size === 1 && data.length > 1) {
        toast({
          title: "Warning",
          description: "All rows have the same program name. This might indicate duplicate data.",
          variant: "warning"
        });
      }
      
      // Check for any bad data like missing teacher names
      const missingTeacherNames = data.filter(
        row => (!row['Accompanying Teacher'] || row['Accompanying Teacher'] === 'Sl. No') &&
               (!row['Folder in Charge'] || row['Folder in Charge'] === '"Class Wise/')
      );
      
      if (missingTeacherNames.length > 0) {
        toast({
          title: "Missing teacher names",
          description: `${missingTeacherNames.length} entries are missing teacher names`,
          variant: "warning"
        });
      }
      
      setPreviewData(data);
      
      // If data is valid, save it
      if (!hasErrors && data.length > 0) {
        excelService.saveTeacherData(data);
        toast({
          title: "Data imported",
          description: `Successfully imported ${data.length} teacher assignments`,
        });
      }
    } catch (error) {
      console.error("Error processing data:", error);
      setHasErrors(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error processing data');
      setPreviewData([]);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Import Teacher Data</CardTitle>
        <CardDescription>
          Upload a CSV file with teacher and class information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FileUploader onDataLoaded={handleDataLoaded} />
        
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <FormatHelp 
          showHelp={showHelp} 
          setShowHelp={setShowHelp} 
          requiredColumns={requiredColumns} 
        />
        
        <DataPreview previewData={previewData} />
        
        {previewData.length > 0 && (
          <Button 
            className="w-full mt-4" 
            onClick={() => {
              excelService.saveTeacherData(previewData);
              toast({
                title: "Data saved",
                description: `${previewData.length} teacher assignments saved`
              });
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Save Teacher Assignments
          </Button>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3 w-3 mr-1" /> 
        CSV columns needed: Programme Name, Robe Email ID, Folder Email ID, Accompanying Teacher, Folder in Charge
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
