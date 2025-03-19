
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';

/**
 * Hook to manage teacher operations (add, edit, delete)
 */
export const useTeacherOperations = (
  teachers: any[],
  setTeachers: React.Dispatch<React.SetStateAction<any[]>>,
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const { toast } = useToast();

  const handleAddTeacher = (
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
    
    // Create a new teacher entry in the Excel-compatible format
    const newTeacherRaw: Record<string, string> = {
      "Programme Name": classes[0] || '',
      "Robe Email ID": emailType === 'robe' ? email : '',
      "Folder Email ID": emailType === 'folder' ? email : '',
      "Accompanying Teacher": emailType === 'robe' ? name : '',
      "Folder in Charge": emailType === 'folder' ? name : '',
    };
    
    // Get the current teachers list and add the new teacher
    const currentTeachers = getAllTeachers();
    const updatedTeachers = [...currentTeachers, newTeacherRaw];
    
    // Update the teachers list in storage
    updateTeachersList(updatedTeachers);
    
    // Format for the UI table
    const newTeacherFormatted = {
      id: (teachers.length + 1).toString(),
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
  };

  const handleUpdateTeacher = (
    currentTeacher: any,
    newTeacherName: string,
    newTeacherEmail: string,
    newTeacherRole: Role,
    selectedClasses: string[]
  ) => {
    if (!currentTeacher) return;
    
    // Update in the UI first
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === currentTeacher.id 
        ? { 
            ...teacher, 
            name: newTeacherName, 
            email: newTeacherEmail, 
            role: newTeacherRole,
            assignedClasses: selectedClasses
          } 
        : teacher
    );
    
    setTeachers(updatedTeachers);
    
    // Update in the storage
    const allTeachers = getAllTeachers();
    const index = parseInt(currentTeacher.id) - 1;
    
    if (index >= 0 && index < allTeachers.length) {
      allTeachers[index] = {
        ...allTeachers[index],
        "Programme Name": selectedClasses[0] || allTeachers[index]["Programme Name"],
        "Robe Email ID": newTeacherRole === 'robe-in-charge' ? newTeacherEmail : '',
        "Folder Email ID": newTeacherRole === 'folder-in-charge' ? newTeacherEmail : '',
        "Accompanying Teacher": newTeacherRole === 'robe-in-charge' ? newTeacherName : '',
        "Folder in Charge": newTeacherRole === 'folder-in-charge' ? newTeacherName : '',
      };
      
      updateTeachersList(allTeachers);
    }
    
    toast({
      title: "Teacher Updated",
      description: `${newTeacherName}'s information has been updated`,
    });
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteTeacher = (id: string) => {
    // Find the teacher to delete
    const teacherIndex = teachers.findIndex(t => t.id === id);
    
    if (teacherIndex !== -1) {
      // Remove from the UI
      const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
      setTeachers(updatedTeachers);
      
      // Remove from storage
      const allTeachers = getAllTeachers();
      const storageIndex = parseInt(id) - 1;
      
      if (storageIndex >= 0 && storageIndex < allTeachers.length) {
        const newTeachersList = [...allTeachers];
        newTeachersList.splice(storageIndex, 1);
        updateTeachersList(newTeachersList);
      }
      
      toast({
        title: "Teacher Removed",
        description: "The teacher has been removed from the system",
      });
    }
  };

  return {
    handleAddTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
  };
};
