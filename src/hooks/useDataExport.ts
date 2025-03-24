
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { excelService } from '@/services/excel';
import { supabase } from '@/integrations/supabase/client';

export const useDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportCurrentData = async () => {
    setIsExporting(true);
    try {
      const { data: teachersData, error } = await supabase
        .from('teachers')
        .select('*');
        
      if (error) throw error;
      
      const formattedData = teachersData.map(teacher => ({
        'Programme Name': teacher.program_name,
        'Robe Email ID': teacher.robe_email,
        'Folder Email ID': teacher.folder_email,
        'Accompanying Teacher': teacher.robe_in_charge,
        'Folder in Charge': teacher.folder_in_charge,
        'Class Wise/\nSection Wise': teacher.class_section
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
      a.download = 'teachers_data.csv';
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
