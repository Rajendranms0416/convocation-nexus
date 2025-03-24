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
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleDataLoaded = async (data: any[]) => {
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
      
      // Check for potential duplicate data
      const uniquePrograms = new Set(data.map(row => row['Programme Name']));
      if (uniquePrograms.size === 1 && data.length > 1) {
        toast({
          title: "Warning",
          description: "All rows have the same program name. This might indicate duplicate data.",
          variant: "default"
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
          variant: "default"
        });
      }
      
      // Enhance the data to ensure all required fields are present
      const enhancedData = excelService.enhanceTeacherData(data);
      setPreviewData(enhancedData);
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
        description: "Please upload a CSV file first",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      // Save directly to localStorage
      updateTeachersList(previewData);
      
      // Force refresh the teacher display
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
      
      toast({
        title: "Data saved",
        description: `${previewData.length} teacher assignments saved to local storage`
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
            {isSaving ? 'Saving...' : 'Save Teacher Assignments'}
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
