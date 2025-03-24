
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import FileUploader from './excel/FileUploader';
import FormatHelp from './excel/FormatHelp';
import DataPreview from './excel/DataPreview';
import { excelService } from '@/services/excel';
import { updateTeachersList } from '@/utils/authHelpers';

// No longer enforcing specific columns
const suggestedColumns = [
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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleDataLoaded = async (data: any[]) => {
    // Check if there's any data
    if (!data || data.length === 0) {
      setHasErrors(true);
      setErrorMessage('No data found in the file.');
      setPreviewData([]);
      return;
    }
    
    try {
      // We'll accept any data structure now
      const firstRow = data[0];
      const availableColumns = Object.keys(firstRow);
      
      console.log('Available columns:', availableColumns);
      
      // Check for potentially useful columns, but don't require them
      const foundColumns = suggestedColumns.filter(
        col => availableColumns.includes(col)
      );
      
      if (foundColumns.length > 0) {
        toast({
          title: "Found useful columns",
          description: `These useful columns were found: ${foundColumns.join(', ')}`,
          variant: "default"
        });
      }
      
      // Just accept any data structure - no more validation
      setPreviewData(data);
      setHasErrors(false);
      setErrorMessage('');
      
    } catch (error) {
      console.error("Error processing data:", error);
      setHasErrors(true);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error processing data');
      setPreviewData([]);
    }
  };

  const handleSaveData = async () => {
    if (previewData.length === 0) {
      toast({
        title: "No data to save",
        description: "Please upload a file first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      // Save to localStorage
      updateTeachersList(previewData);
      
      // Force refresh the teacher display
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
      
      toast({
        title: "Data saved",
        description: `${previewData.length} records saved to local storage`
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Error saving data",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Import Data</CardTitle>
        <CardDescription>
          Upload any CSV or Excel file with tabular data
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
          requiredColumns={suggestedColumns} 
        />
        
        {previewData.length > 0 && (
          <div>
            <h3 className="text-md font-medium mb-2">Data Preview</h3>
            <DataPreview previewData={previewData} />
          </div>
        )}
        
        {previewData.length > 0 && (
          <Button 
            className="w-full mt-4" 
            onClick={handleSaveData}
            disabled={isSaving}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Data'}
          </Button>
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3 w-3 mr-1" /> 
        Upload any CSV or Excel file - all columns will be preserved
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
