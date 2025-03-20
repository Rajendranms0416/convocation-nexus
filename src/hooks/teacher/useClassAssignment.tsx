
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
      // Update in the UI
      const updatedTeachers = teachers.map(teacher => 
        teacher.id === currentTeacher.id 
          ? { ...teacher, assignedClasses: selectedClasses } 
          : teacher
      );
      
      setTeachers(updatedTeachers);
      
      // Update in database
      if (currentTeacher.dbId) {
        console.log(`Updating teacher with dbId: ${currentTeacher.dbId}`);
        const { error } = await supabase
          .from('teachers')
          .update({
            program_name: selectedClasses[0] || '',
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentTeacher.dbId);
        
        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Database error: ${error.message}`);
        }
      } else {
        // If no dbId, try to find the teacher by email in the database
        const emailField = currentTeacher.role === 'robe-in-charge' ? 'robe_email' : 'folder_email';
        
        console.log(`Looking for teacher with ${emailField} = ${currentTeacher.email}`);
        const { data, error: fetchError } = await supabase
          .from('teachers')
          .select('*')
          .eq(emailField, currentTeacher.email)
          .limit(1);
        
        if (fetchError) {
          console.error('Error finding teacher in database:', fetchError);
        } else if (data && data.length > 0) {
          // Update the existing record
          console.log(`Found teacher in db with id: ${data[0].id}`);
          const { error: updateError } = await supabase
            .from('teachers')
            .update({
              program_name: selectedClasses[0] || '',
              updated_at: new Date().toISOString(),
            })
            .eq('id', data[0].id);
          
          if (updateError) {
            console.error('Supabase update error:', updateError);
            throw new Error(`Database error: ${updateError.message}`);
          }
        } else {
          // Create a new record
          console.log('No teacher found in db, creating new record');
          const newRecord = {
            program_name: selectedClasses[0] || '',
            robe_email: currentTeacher.role === 'robe-in-charge' ? currentTeacher.email : '',
            folder_email: currentTeacher.role === 'folder-in-charge' ? currentTeacher.email : '',
            accompanying_teacher: currentTeacher.role === 'robe-in-charge' ? currentTeacher.name : '',
            folder_in_charge: currentTeacher.role === 'folder-in-charge' ? currentTeacher.name : '',
            class_section: currentTeacher.section || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: insertedData, error: insertError } = await supabase
            .from('teachers')
            .insert(newRecord)
            .select()
            .single();
          
          if (insertError) {
            console.error('Supabase insert error:', insertError);
            throw new Error(`Database error: ${insertError.message}`);
          }
          
          if (insertedData) {
            // Update teacher with new dbId
            const newTeachers = teachers.map(teacher => 
              teacher.id === currentTeacher.id 
                ? { ...teacher, dbId: insertedData.id } 
                : teacher
            );
            setTeachers(newTeachers);
          }
        }
      }
      
      // Update in local storage
      const allTeachers = getAllTeachers();
      const programIndex = allTeachers.findIndex(t => 
        t['Programme Name'] === currentTeacher.program ||
        (currentTeacher.role === 'robe-in-charge' && t['Robe Email ID'] === currentTeacher.email) ||
        (currentTeacher.role === 'folder-in-charge' && t['Folder Email ID'] === currentTeacher.email)
      );
      
      if (programIndex >= 0 && selectedClasses.length > 0) {
        allTeachers[programIndex] = {
          ...allTeachers[programIndex],
          "Programme Name": selectedClasses[0] // Use first selected class as programme name
        };
        
        updateTeachersList(allTeachers);
      }
      
      toast({
        title: "Classes Assigned",
        description: `Updated class assignments for ${currentTeacher.name}`,
      });
      
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
