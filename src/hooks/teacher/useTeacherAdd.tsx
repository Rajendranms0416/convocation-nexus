
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
    emailType: 'robe' | 'folder' | 'presenter', // Updated to include 'presenter'
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
        "Presenter Email ID": emailType === 'presenter' ? email : '',
        "Presenter": emailType === 'presenter' ? name : '',
        "Class Wise/\nSection Wise": '',
      };
      
      // Get the current teachers list and add the new teacher for local storage
      const currentTeachers = getAllTeachers();
      const updatedTeachers = [...currentTeachers, newTeacherRaw];
      updateTeachersList(updatedTeachers);
      
      // Format for the UI table
      const newTeacherFormatted = {
        id: `${emailType}-${teachers.length + 1}`,
        name: name,
        email: email,
        role: role,
        program: classes[0] || '',
        assignedClasses: classes,
        rawData: newTeacherRaw
      };
      
      setTeachers([...teachers, newTeacherFormatted]);
      
      toast({
        title: "Teacher Added",
        description: `${name} has been added as ${role}`,
      });

      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('teacherDataUpdated'));
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
