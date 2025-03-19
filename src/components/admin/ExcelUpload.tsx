
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, FileSpreadsheet, Upload, Info, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { excelService } from '@/services/excelService';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the expected column structure
const requiredColumns = [
  'Programme Name',
  'Robe Email ID',
  'Folder Email ID',
  'Accompanying Teacher',
  'Folder in Charge'
];

const ExcelUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setUploadError(null);
      setFileInfo(`Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`);
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
      
      console.log('File content preview:', fileContent.substring(0, 200) + '...');
      
      // Parse the CSV data with debug mode enabled
      const parsedData = excelService.parseCSV(fileContent, true);
      console.log('Parsed data:', parsedData);
      
      // Validate the data
      excelService.validateTeacherData(parsedData);
      
      // Save the data
      const savedData = excelService.saveTeacherData(parsedData);
      
      setPreviewData(savedData.slice(0, 5)); // Show first 5 rows as preview
      
      toast({
        title: 'CSV file uploaded successfully',
        description: `Loaded ${savedData.length} teacher records.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload file');
      
      toast({
        title: 'Failed to upload CSV file',
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
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Import Teacher Data</CardTitle>
        <CardDescription>
          Upload a CSV file with teacher information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="flex-1"
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="flex-1 sm:flex-none"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
              <Upload className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={exportCurrentData}
              className="flex-1 sm:flex-none"
            >
              Export
              <Download className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {fileInfo && (
          <p className="text-xs text-muted-foreground">{fileInfo}</p>
        )}
        
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground p-0 h-auto" 
            onClick={() => setShowHelp(!showHelp)}
          >
            <Info className="h-3 w-3 mr-1" /> 
            {showHelp ? 'Hide format help' : 'Show format help'}
          </Button>
        </div>
        
        {showHelp && (
          <Alert className="bg-muted/50">
            <AlertTitle className="text-sm">Format Information</AlertTitle>
            <AlertDescription className="text-xs">
              <p>Your CSV file should include these columns:</p>
              <ul className="list-disc pl-5 mt-1 space-y-0.5">
                <li><strong>Programme Name</strong> - The program or class name</li>
                <li><strong>Robe Email ID</strong> - Email of the teacher in charge of robes</li>
                <li><strong>Folder Email ID</strong> - Email of the teacher in charge of folders</li>
                <li><strong>Accompanying Teacher</strong> - Name of the robe-in-charge teacher</li>
                <li><strong>Folder in Charge</strong> - Name of the folder-in-charge teacher</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
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
        )}
      </CardContent>
      <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
        <FileSpreadsheet className="h-3 w-3 mr-1" /> 
        CSV columns needed: Programme Name, Robe Email ID, Folder Email ID
      </CardFooter>
    </Card>
  );
};

export default ExcelUpload;
