
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { queryDynamicTable } from '@/integrations/supabase/client';
import { DynamicTableRow } from '@/integrations/supabase/custom-types';

/**
 * Hook for exporting data to Excel
 */
export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  /**
   * Export table data to Excel
   */
  const exportToExcel = async (tableName: string, fileName: string) => {
    setIsExporting(true);
    
    try {
      // Fetch data from the dynamic table
      const { data, error } = await queryDynamicTable(tableName).select('*');
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }
      
      // Convert data for Excel format
      const excelData = (data as any[]).map(row => ({
        "Id": row.id,
        "Programme Name": row.Programme_Name || '',
        "Robe Email ID": row.Robe_Email_ID || '',
        "Folder Email ID": row.Folder_Email_ID || '',
        "Accompanying Teacher": row.Accompanying_Teacher || '',
        "Folder in Charge": row.Folder_in_Charge || '',
        "Class Section": row.Class_Section || '',
        "Created At": row.created_at ? new Date(row.created_at).toLocaleString() : '',
        "Updated At": row.updated_at ? new Date(row.updated_at).toLocaleString() : ''
      }));
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
      
      // Generate Excel file and trigger download
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportToExcel,
    isExporting
  };
};
