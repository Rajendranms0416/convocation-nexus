
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';
import { supabase } from '@/integrations/supabase/client';

export const useDataExport = (tableName?: string) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportCurrentData = async () => {
    setIsExporting(true);
    try {
      let teachersData: any[] = [];
      
      if (tableName) {
        // Export data from the specific table
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) throw error;
        teachersData = data;
      } else {
        // Fallback to the default teachers table
        const { data, error } = await supabase
          .from('teachers')
          .select('*');
          
        if (error) throw error;
        teachersData = data;
      }
      
      const formattedData = teachersData.map(teacher => ({
        'Programme Name': teacher.Programme_Name || '',
        'Robe Email ID': teacher.Robe_Email_ID || '',
        'Folder Email ID': teacher.Folder_Email_ID || '',
        'Accompanying Teacher': teacher.Accompanying_Teacher || '',
        'Folder in Charge': teacher.Folder_in_Charge || '',
        'Class Wise/\nSection Wise': teacher.Class_Section || ''
      }));
      
      const csvContent = excelService.generateCSV(formattedData);
      
      if (!csvContent) {
        toast({
          title: 'No data to export',
          description: 'There are no teacher records currently loaded.',
          variant: 'destructive',
        });
        setIsExporting(false);
        return;
      }

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = tableName ? `${tableName}_data.csv` : 'teachers_data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Data exported successfully',
        description: `Exported teacher records.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Failed to export data',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportCurrentData
  };
};
