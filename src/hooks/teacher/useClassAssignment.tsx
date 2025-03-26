
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { queryDynamicTable, supabase } from '@/integrations/supabase/client';
import { DynamicTableRow } from '@/integrations/supabase/custom-types';

/**
 * Hook to manage class assignment operations
 */
export const useClassAssignment = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle class assignment dialog open
   */
  const handleAssignClasses = (teacher: any) => {
    setIsClassAssignDialogOpen(true);
    return teacher;
  };

  /**
   * Save class assignments to the database
   */
  const saveClassAssignments = async (teacherId: string, classNames: string[]) => {
    setIsSaving(true);
    
    try {
      // Find the teacher to update
      const teacher = teachers.find(t => t.id === teacherId);
      
      if (!teacher) {
        throw new Error(`Teacher with ID ${teacherId} not found`);
      }
      
      // Check if we're using a dynamic table (from file upload)
      if (teacher.tableName) {
        // Update in dynamic table
        const updatedData = {
          Programme_Name: teacher.Programme_Name || '',
          Robe_Email_ID: teacher.Robe_Email_ID,
          Folder_Email_ID: teacher.Folder_Email_ID,
          Accompanying_Teacher: teacher.Accompanying_Teacher,
          Folder_in_Charge: teacher.Folder_in_Charge,
          Class_Section: classNames.join(', '),
          updated_at: new Date().toISOString()
        };
        
        // Cast to any to avoid TypeScript errors with dynamic tables
        const { error: updateError } = await queryDynamicTable(teacher.tableName)
          .update(updatedData as any)
          .eq('id', teacher.id);
        
        if (updateError) {
          throw updateError;
        }
        
        // Update multiple records if needed (for bulk class assignment)
        if (classNames.length > 1) {
          const bulkUpdates = classNames.map(className => ({
            Programme_Name: teacher.Programme_Name || '',
            Robe_Email_ID: teacher.Robe_Email_ID,
            Folder_Email_ID: teacher.Folder_Email_ID,
            Accompanying_Teacher: teacher.Accompanying_Teacher,
            Folder_in_Charge: teacher.Folder_in_Charge,
            Class_Section: className,
            updated_at: new Date().toISOString()
          }));
          
          // Insert new records for additional classes
          if (bulkUpdates.length > 1) {
            const { error: insertError } = await queryDynamicTable(teacher.tableName)
              .insert(bulkUpdates.slice(1) as any[]);
            
            if (insertError) {
              console.error('Error inserting additional class records:', insertError);
            }
          }
        }
      } else {
        // Update in the standard teachers table
        const updatedData = {
          "Programme Name": teacher["Programme Name"] || '',
          "Robe Email ID": teacher["Robe Email ID"],
          "Folder Email ID": teacher["Folder Email ID"],
          "Robe in Charge": teacher["Robe in Charge"],
          "Folder in Charge": teacher["Folder in Charge"],
        };
        
        // Cast to any to avoid TypeScript errors with dynamic tables
        const { error: updateError } = await supabase
          .from('teachers')
          .update(updatedData as any)
          .eq('id', teacher.id);
        
        if (updateError) {
          throw updateError;
        }
        
        // Insert new records for additional classes if needed
        if (classNames.length > 1) {
          const bulkUpdates = classNames.map(className => ({
            "Programme Name": teacher["Programme Name"] || '',
            "Robe Email ID": teacher["Robe Email ID"],
            "Folder Email ID": teacher["Folder Email ID"],
            "Robe in Charge": teacher["Robe in Charge"],
            "Folder in Charge": teacher["Folder in Charge"]
          }));
          
          // Insert new records for additional classes
          if (bulkUpdates.length > 1) {
            const { error: insertError } = await supabase
              .from('teachers')
              .insert(bulkUpdates.slice(1) as any[]);
            
            if (insertError) {
              console.error('Error inserting additional class records:', insertError);
            }
          }
        }
      }
      
      // Update local state
      const updatedTeachers = teachers.map(t => {
        if (t.id === teacherId) {
          // Handle type consistency based on table type
          if (t.tableName) {
            return { ...t, Class_Section: classNames.join(', ') };
          } else {
            return { ...t, "Class Section": classNames.join(', ') };
          }
        }
        return t;
      });
      
      // Add new records for additional classes if needed
      if (classNames.length > 1) {
        const originalTeacher = teachers.find(t => t.id === teacherId);
        const additionalTeachers = classNames.slice(1).map((className, index) => {
          const newId = `${teacherId}-${index + 1}`;
          if (originalTeacher?.tableName) {
            return {
              ...originalTeacher,
              id: newId,
              Class_Section: className
            };
          } else {
            return {
              ...originalTeacher,
              id: newId,
              "Class Section": className
            };
          }
        });
        
        // Combine original updated teachers with new ones
        setTeachers([...updatedTeachers, ...additionalTeachers]);
      } else {
        setTeachers(updatedTeachers);
      }
      
      toast({
        title: 'Classes assigned successfully',
        description: `Classes have been assigned to the teacher.`,
      });
      
      // Close the dialog
      setIsClassAssignDialogOpen(false);
      
      return true;
    } catch (error) {
      console.error('Error assigning classes:', error);
      
      toast({
        title: 'Failed to assign classes',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsSaving(false);
    }
  };
  
  return {
    handleAssignClasses,
    saveClassAssignments,
    isSaving
  };
};
