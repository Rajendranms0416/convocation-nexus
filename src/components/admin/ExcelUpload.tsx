
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, FileSpreadsheet, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { updateTeachersList, getAllTeachers } from '@/utils/authHelpers';

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

  const validateExcelData = (data: any[]) => {
    if (!data || data.length === 0) {
      throw new Error('The Excel file is empty or could not be parsed.');
    }

    // Check if required columns exist
    const firstRow = data[0];
    const missingColumns = requiredColumns.filter(col => !(col in firstRow));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }

    // Check for invalid or empty email values
    const invalidRows = data.filter(row => {
      const robeEmail = row['Robe Email ID'];
      const folderEmail = row['Folder Email ID'];
      
      // At least one of the emails should be valid
      return (!robeEmail || !robeEmail.includes('@')) && 
             (!folderEmail || !folderEmail.includes('@'));
    });

    if (invalidRows.length > 0) {
      throw new Error(`${invalidRows.length} rows have invalid email formats.`);
    }

    return true;
  };

  const parseExcelFile = (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          // Parse CSV data (assuming comma-separated)
          if (typeof data === 'string') {
            const rows = data.split('\n');
            const headers = rows[0].split(',').map(h => h.trim());
            
            const parsedData = rows.slice(1).map(row => {
              const values = row.split(',').map(v => v.trim());
              const rowData: Record<string, string> = {};
              
              headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
              });
              
              return rowData;
            }).filter(row => Object.values(row).some(val => val)); // Remove empty rows
            
            resolve(parsedData);
          } else {
            reject(new Error('Invalid file data'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading the file'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const data = await parseExcelFile(file);
      validateExcelData(data);
      
      // Update the teachers list
      updateTeachersList(data);
      
      setPreviewData(data.slice(0, 5)); // Show first 5 rows as preview
      
      toast({
        title: 'Excel file uploaded successfully',
        description: `Loaded ${data.length} teacher records.`,
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
    const teachers = getAllTeachers();
    if (teachers.length === 0) {
      toast({
        title: 'No data to export',
        description: 'There are no teacher records currently loaded.',
        variant: 'destructive',
      });
      return;
    }

    // Create CSV content
    const headers = Object.keys(teachers[0]).join(',');
    const rows = teachers.map(teacher => 
      Object.values(teacher).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
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
      description: `Exported ${teachers.length} teacher records.`,
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
