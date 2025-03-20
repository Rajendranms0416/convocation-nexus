import { useToast } from '@/hooks/use-toast';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Determine method to identify this teacher in the database
      let teacherIdentifier = {};
      let newRecord = {};
      
      // If we have a database ID, use that
      if (currentTeacher.dbId) {
        console.log(`Using database ID ${currentTeacher.dbId} to update teacher`);
        teacherIdentifier = { id: currentTeacher.dbId };
      } 
      // Otherwise try to identify by email based on role
      else if (currentTeacher.email) {
        const emailField = currentTeacher.role === 'robe-in-charge' ? 'robe_email' : 'folder_email';
        console.log(`Using ${emailField} = ${currentTeacher.email} to identify teacher`);
        teacherIdentifier = { [emailField]: currentTeacher.email };
        
        // In case this teacher doesn't exist yet, prepare a full record
        newRecord = {
          program_name: selectedClasses[0] || '',
          robe_email: currentTeacher.role === 'robe-in-charge' ? currentTeacher.email : '',
          folder_email: currentTeacher.role === 'folder-in-charge' ? currentTeacher.email : '',
          accompanying_teacher: currentTeacher.role === 'robe-in-charge' ? currentTeacher.name : '',
          folder_in_charge: currentTeacher.role === 'folder-in-charge' ? currentTeacher.name : '',
          class_section: currentTeacher.section || '',
        };
      } else {
        throw new Error('Cannot identify teacher - no ID or email');
      }
      
      // Try an upsert first - this will insert if it doesn't exist or update if it does
      const { data: upsertResult, error: upsertError } = await supabase
        .from('teachers')
        .upsert(
          {
            ...newRecord,
            ...teacherIdentifier,
            program_name: selectedClasses[0] || '',
          }, 
          { 
            onConflict: Object.keys(teacherIdentifier)[0],
            ignoreDuplicates: false 
          }
        )
        .select();
      
      if (upsertError) {
        console.error('Error upserting teacher:', upsertError);
        throw new Error(`Database error: ${upsertError.message}`);
      }
      
      console.log('Upsert result:', upsertResult);
      
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
      
      setIsClassAssignDialogOpen(false);
    } catch (error) {
      console.error('Error assigning classes:', error);
      toast({
        title: "Error Assigning Classes",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleAssignClasses,
    saveClassAssignments,
  };
};
