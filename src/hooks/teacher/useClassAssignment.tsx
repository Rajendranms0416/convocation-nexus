
import { useToast } from '@/hooks/use-toast';
import { updateDynamicTable, updateTeachersTable } from '@/utils/dynamicTableHelpers';
import { DynamicTableInsert } from '@/integrations/supabase/custom-types';

/**
 * Hook for class assignment functionality
 */
export const useClassAssignment = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleAssignClasses = (
    teacher: any,
    setTeacher: React.Dispatch<React.SetStateAction<any>>,
    setClasses: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setTeacher(teacher);
    setClasses(teacher.assignedClasses || []);
  };

  const saveClassAssignments = async (teacher: any, classes: string[]) => {
    if (!teacher) {
      toast({
        title: "Error",
        description: "No teacher selected for class assignment",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log("Saving class assignments for teacher:", teacher);
      
      // Update the teacher's assigned classes in our UI state
      const updatedTeachers = teachers.map(t => {
        if (t.id === teacher.id) {
          return { ...t, assignedClasses: classes };
        }
        return t;
      });
      
      setTeachers(updatedTeachers);
      
      // If we have a database ID, update in the database
      if (teacher.dbId) {
        // Update the teacher in our dynamic table
        if (teacher.dbTable) {
          const updateData: DynamicTableInsert = {
            Programme_Name: classes[0] || teacher.program || '',
            Robe_Email_ID: teacher.role === 'robe-in-charge' ? teacher.email : '',
            Folder_Email_ID: teacher.role === 'folder-in-charge' ? teacher.email : '',
            Accompanying_Teacher: teacher.role === 'robe-in-charge' ? teacher.name : '',
            Folder_in_Charge: teacher.role === 'folder-in-charge' ? teacher.name : '',
            Class_Section: classes.join(', ')
          };
          
          const { error } = await updateDynamicTable(teacher.dbTable, updateData, teacher.dbId);
          
          if (error) throw error;
        } else {
          // Update in the main teachers table
          const teachersUpdate = {
            "Programme Name": classes[0] || teacher.program || '',
            "Robe Email ID": teacher.role === 'robe-in-charge' ? teacher.email : '',
            "Folder Email ID": teacher.role === 'folder-in-charge' ? teacher.email : '',
            "Robe in Charge": teacher.role === 'robe-in-charge' ? teacher.name : '',
            "Folder in Charge": teacher.role === 'folder-in-charge' ? teacher.name : ''
          };
          
          const { error } = await updateTeachersTable(teachersUpdate, teacher.dbId);
          
          if (error) throw error;
        }
      }
      
      setIsClassAssignDialogOpen(false);
      
      toast({
        title: "Classes Assigned",
        description: `Successfully assigned ${classes.length} classes to ${teacher.name}`,
      });
    } catch (error) {
      console.error('Error saving class assignments:', error);
      toast({
        title: "Error Saving Assignments",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleAssignClasses,
    saveClassAssignments
  };
};
