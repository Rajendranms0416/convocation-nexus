import { useToast } from '@/hooks/use-toast';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase, queryDynamicTable } from '@/integrations/supabase/client';

/**
 * Hook to manage class assignments for teachers
 */
export const useClassAssignment = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsClassAssignDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleAssignClasses = (
    teacher: any,
    setCurrentTeacher: React.Dispatch<React.SetStateAction<any>>,
    setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setCurrentTeacher(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setIsClassAssignDialogOpen(true);
  };

  const saveClassAssignments = async (
    currentTeacher: any,
    selectedClasses: string[]
  ) => {
    if (!currentTeacher) return;
    
    try {
      console.log('Saving class assignments for teacher:', currentTeacher);
      console.log('Selected classes:', selectedClasses);
      
      // Update in the UI first
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === currentTeacher.id 
          ? { ...teacher, assignedClasses: selectedClasses } 
          : teacher
      );
      
      setTeachers(updatedTeachers);
      
      let upsertResult;
      
      // Check if we're using a dynamic table or the default table
      if (currentTeacher.dbTable) {
        // Prepare the data for database update with the correct field names for dynamic tables
        let teacherData = {
          "Programme_Name": selectedClasses[0] || '',
          "Robe_Email_ID": currentTeacher.role === 'robe-in-charge' ? currentTeacher.email : '',
          "Folder_Email_ID": currentTeacher.role === 'folder-in-charge' ? currentTeacher.email : '',
          "Accompanying_Teacher": currentTeacher.role === 'robe-in-charge' ? currentTeacher.name : '',
          "Folder_in_Charge": currentTeacher.role === 'folder-in-charge' ? currentTeacher.name : '',
          "Class_Section": currentTeacher.section || '',
          "updated_at": new Date().toISOString()
        };
        
        console.log('Data to save to dynamic table:', teacherData);
        
        // Try to upsert the record
        if (currentTeacher.dbId) {
          // If we have a database ID, use that for the update
          console.log(`Updating existing record with ID ${currentTeacher.dbId} in table ${currentTeacher.dbTable}`);
          const response = await queryDynamicTable(currentTeacher.dbTable)
            .update(teacherData)
            .eq('id', currentTeacher.dbId)
            .select();
            
          upsertResult = response.data;
        } else {
          // Otherwise insert a new record
          console.log(`Inserting new record in table ${currentTeacher.dbTable}`);
          const response = await queryDynamicTable(currentTeacher.dbTable)
            .insert([teacherData])
            .select();
            
          upsertResult = response.data;
        }
      } else {
        // Using the default teachers table
        // Prepare data for the default table structure
        let teacherData = {
          "Programme Name": selectedClasses[0] || '',
          "Robe Email ID": currentTeacher.role === 'robe-in-charge' ? currentTeacher.email : '',
          "Folder Email ID": currentTeacher.role === 'folder-in-charge' ? currentTeacher.email : '',
          "Robe in Charge": currentTeacher.role === 'robe-in-charge' ? currentTeacher.name : '',
          "Folder in Charge": currentTeacher.role === 'folder-in-charge' ? currentTeacher.name : '',
        };
        
        console.log('Data to save to default table:', teacherData);
        
        if (currentTeacher.dbId) {
          console.log(`Updating existing record with ID ${currentTeacher.dbId} in default table`);
          const response = await supabase
            .from('teachers')
            .update(teacherData)
            .eq('id', currentTeacher.dbId)
            .select();
            
          upsertResult = response.data;
        } else {
          console.log('Inserting new record in default table');
          const response = await supabase
            .from('teachers')
            .insert([teacherData])
            .select();
            
          upsertResult = response.data;
        }
      }
      
      // If we got a result back, update the teacher with the database ID
      if (upsertResult && upsertResult.length > 0) {
        const dbId = upsertResult[0].id;
        
        // Update the teachers list with the new dbId
        const teachersWithDbId = teachers.map(teacher => 
          teacher.id === currentTeacher.id 
            ? { ...teacher, dbId, assignedClasses: selectedClasses } 
            : teacher
        );
        
        setTeachers(teachersWithDbId);
      }
      
      // Update in local storage
      const allTeachers = getAllTeachers();
      const teacherIndex = allTeachers.findIndex(t => 
        (currentTeacher.role === 'robe-in-charge' && t['Robe Email ID'] === currentTeacher.email) ||
        (currentTeacher.role === 'folder-in-charge' && t['Folder Email ID'] === currentTeacher.email) ||
        t['Programme Name'] === currentTeacher.program
      );
      
      if (teacherIndex >= 0 && selectedClasses.length > 0) {
        allTeachers[teacherIndex] = {
          ...allTeachers[teacherIndex],
          "Programme Name": selectedClasses[0] // Use first selected class as programme name
        };
        
        updateTeachersList(allTeachers);
      }
      
      // Trigger data refresh
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
    } catch (error) {
      console.error('Error assigning classes:', error);
      toast({
        title: "Error Assigning Classes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      throw error; // Re-throw to let the dialog component handle it
    }
  };

  return {
    handleAssignClasses,
    saveClassAssignments,
  };
};
