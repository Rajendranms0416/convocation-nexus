
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for adding teacher functionality
 */
export const useTeacherAdd = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  const { toast } = useToast();

  const handleAddTeacher = async (
    name: string, 
    email: string, 
    role: Role, 
    emailType: 'robe' | 'folder', 
    classes: string[]
  ) => {
    if (!name || !email || !role) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a new teacher entry in the Excel-compatible format
      const newTeacherRaw: Record<string, string> = {
        "Programme Name": classes[0] || '',
        "Robe Email ID": emailType === 'robe' ? email : '',
        "Folder Email ID": emailType === 'folder' ? email : '',
        "Accompanying Teacher": emailType === 'robe' ? name : '',
        "Folder in Charge": emailType === 'folder' ? name : '',
        "Class Wise/\nSection Wise": '',
      };
      
      // Insert into database
      const { data: insertedTeacher, error } = await supabase
        .from('teachers')
        .insert({
          Programme_Name: classes[0] || '',
          Robe_Email_ID: emailType === 'robe' ? email : '',
          Folder_Email_ID: emailType === 'folder' ? email : '',
          Accompanying_Teacher: emailType === 'robe' ? name : '',
          Folder_in_Charge: emailType === 'folder' ? name : '',
          Class_Section: '',
        })
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Get the current teachers list and add the new teacher for local storage
      const currentTeachers = getAllTeachers();
      const updatedTeachers = [...currentTeachers, newTeacherRaw];
      updateTeachersList(updatedTeachers);
      
      // Format for the UI table
      const newTeacherFormatted = {
        id: (teachers.length + 1).toString(),
        name: name,
        email: email,
        role: role,
        program: classes[0] || '',
        assignedClasses: classes,
        rawData: newTeacherRaw,
        dbId: insertedTeacher?.id
      };
      
      setTeachers([...teachers, newTeacherFormatted]);
      
      toast({
        title: "Teacher Added",
        description: `${name} has been added as ${role}`,
      });
    } catch (error) {
      console.error('Error adding teacher:', error);
      toast({
        title: "Error Adding Teacher",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return {
    handleAddTeacher
  };
};
