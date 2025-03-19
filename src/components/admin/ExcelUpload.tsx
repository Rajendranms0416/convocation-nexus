import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, FileSpreadsheet, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { excelService } from '@/services/excelService';

// Define the expected column structure
const requiredColumns = [
  'Programme Name',
  'Robe Email ID',
  'Folder Email ID'
];

const ExcelUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Read the file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve(e.target.result);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
      });
      
      // Parse the CSV data
      const parsedData = excelService.parseCSV(fileContent);
      console.log('Parsed data:', parsedData);
      
      // Validate the data
      excelService.validateTeacherData(parsedData);
      
      // Normalize and save the data
      const savedData = excelService.saveTeacherData(parsedData);
      
      setPreviewData(savedData.slice(0, 5)); // Show first 5 rows as preview
      
      toast({
        title: 'Excel file uploaded successfully',
        description: `Loaded ${savedData.length} teacher records.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      
      toast({
        title: 'Failed to upload Excel file',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const exportCurrentData = () => {
    const csvContent = excelService.generateCSV();
    
    if (!csvContent) {
      toast({
        title: 'No data to export',
        description: 'There are no teacher records currently loaded.',
        variant: 'destructive',
      });
      return;
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Data exported successfully',
      description: `Exported teacher records.`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Import Teacher Data</CardTitle>
        <CardDescription>
          Upload an Excel file (.csv) with teacher information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="flex-1"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
            <Upload className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
        
        {previewData.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Preview (First 5 entries):</h3>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Programme</th>
                    <th className="p-2 text-left">Robe Email</th>
                    <th className="p-2 text-left">Folder Email</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{row['Programme Name']}</td>
                      <td className="p-2">{row['Robe Email ID']}</td>
                      <td className="p-2">{row['Folder Email ID']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center">
            <FileSpreadsheet className="h-4 w-4 mr-1" /> 
            Required format: CSV with columns for Programme Name, Robe Email ID, and Folder Email ID
          </p>
        </div>
        <Button variant="outline" onClick={exportCurrentData}>
          Export Current Data
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
