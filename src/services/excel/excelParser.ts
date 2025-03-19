
import * as XLSX from 'xlsx';
import { enhanceTeacherData } from './enhance';
import { normalizeHeaderName } from './utils';

/**
 * Parse Excel data from an ArrayBuffer (.xlsx, .xls files)
 * @param buffer The Excel file as ArrayBuffer
 * @returns Parsed data as an array of objects
 */
export const parseExcel = async (buffer: ArrayBuffer): Promise<Record<string, string>[]> => {
  try {
    // Read the Excel file
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { header: 1 });
    
    if (!jsonData || jsonData.length === 0) {
      throw new Error('No data found in the Excel file');
    }
    
    // The first row should be headers
    const headers = jsonData[0] as string[];
    const normalizedHeaders = headers.map(header => 
      normalizeHeaderName(header?.toString() || '')
    );
    
    // Convert rows to objects with the appropriate headers
    const data = jsonData.slice(1).map(row => {
      const obj: Record<string, string> = {};
      
      normalizedHeaders.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          obj[header] = row[index]?.toString() || '';
        }
      });
      
      return obj;
    });
    
    // Filter out empty rows
    const filteredData = data.filter(row => 
      Object.values(row).some(val => val !== undefined && val !== '')
    );
    
    // Enhance the data
    return enhanceTeacherData(filteredData);
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file. Please make sure your file is correctly formatted.');
  }
};
