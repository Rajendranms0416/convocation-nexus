
import { toast } from '@/hooks/use-toast';
import { queryDynamicTable, supabase } from '@/integrations/supabase/client';

/**
 * Hook to manage teacher updates
 */
export const useTeacherUpdate = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  /**
   * Update a teacher's information
   */
  const handleUpdateTeacher = async (
    id: string,
    name: string,
    email: string,
    role: string,
    tableName?: string
  ) => {
    try {
      // Find the teacher to update
      const teacher = teachers.find(t => t.id === id);
      
      if (!teacher) {
        throw new Error(`Teacher with ID ${id} not found`);
      }
      
      // Check if we're using a dynamic table (from file upload)
      if (tableName) {
        // Update in dynamic table
        const updatedData = {
          Programme_Name: name,
          Robe_Email_ID: email,
          Folder_Email_ID: email,
          Accompanying_Teacher: role === 'accompanying' ? name : '',
          Folder_in_Charge: role === 'folder' ? name : '',
          updated_at: new Date().toISOString()
        };
        
        // Cast to any to avoid TypeScript errors with dynamic tables
        const { error: updateError } = await queryDynamicTable(tableName)
          .update(updatedData as any)
          .eq('id', id);
        
        if (updateError) {
          throw updateError;
        }
      } else {
        // Update in the standard teachers table - convert string ID to number explicitly
        const updatedData = {
          "Programme Name": name,
          "Robe Email ID": email,
          "Folder Email ID": email,
          "Robe in Charge": role === 'robe' ? name : '',
          "Folder in Charge": role === 'folder' ? name : ''
        };
        
        // Cast to any to avoid TypeScript errors with dynamic tables
        const { error: updateError } = await supabase
          .from('teachers')
          .update(updatedData as any)
          .eq('id', parseInt(id, 10));  // Explicitly parse to number with base 10
        
        if (updateError) {
          throw updateError;
        }
      }
      
      // Update local state
      const updatedTeachers = teachers.map(t => {
        if (t.id === id) {
          // Handle type consistency based on table type
          if (tableName) {
            return {
              ...t,
              Programme_Name: name,
              Robe_Email_ID: email,
              Folder_Email_ID: email,
              Accompanying_Teacher: role === 'accompanying' ? name : '',
              Folder_in_Charge: role === 'folder' ? name : ''
            };
          } else {
            return {
              ...t,
              "Programme Name": name,
              "Robe Email ID": email,
              "Folder Email ID": email,
              "Robe in Charge": role === 'robe' ? name : '',
              "Folder in Charge": role === 'folder' ? name : ''
            };
          }
        }
        return t;
      });
      
      setTeachers(updatedTeachers);
      
      toast({
        title: 'Teacher updated successfully',
        description: `Teacher "${name}" has been updated.`,
      });
      
      // Close the dialog
      setIsEditDialogOpen(false);
      
      return true;
    } catch (error) {
      console.error('Error updating teacher:', error);
      
      toast({
        title: 'Failed to update teacher',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
      
      return false;
    }
  };
  
  return {
    handleUpdateTeacher
  };
};
