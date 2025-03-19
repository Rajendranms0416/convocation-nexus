
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Role } from '@/types';
import { getAllTeachers, updateTeachersList } from '@/utils/authHelpers';

export const useTeacherManagement = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClassAssignDialogOpen, setIsClassAssignDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  
  // Form states
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState<Role>('presenter');
  const [emailType, setEmailType] = useState<'robe' | 'folder'>('robe');
  
  // Class assignment states
  const [availableClasses, setAvailableClasses] = useState([
    'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
    'MCA 1st Year', 'MCA 2nd Year', 
    'BCom 1st Year', 'BCom 2nd Year', 'BCom 3rd Year',
    'MBA 1st Year', 'MBA 2nd Year'
  ]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const { toast } = useToast();

  // Load teacher data
  useEffect(() => {
    const loadedTeachers = getAllTeachers();
    
    // Transform to the format needed for the table
    const formattedTeachers = loadedTeachers.map((teacher, index) => ({
      id: (index + 1).toString(),
      name: teacher['Accompanying Teacher'] || teacher['Folder in Charge'] || 'Unknown',
      email: teacher['Robe Email ID'] || teacher['Folder Email ID'] || '',
      role: teacher['Robe Email ID'] ? 'robe-in-charge' : 'folder-in-charge',
      program: teacher['Programme Name'] || '',
      section: teacher['Class Wise/\nSection Wise'] || '',
      assignedClasses: [teacher['Programme Name'] || ''],
      rawData: teacher // Keep the original data for reference
    }));
    
    setTeachers(formattedTeachers);
  }, []);

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

  const handleEditTeacher = (teacher: any) => {
    setCurrentTeacher(teacher);
    setNewTeacherName(teacher.name);
    setNewTeacherEmail(teacher.email);
    setNewTeacherRole(teacher.role);
    setEmailType(teacher.role === 'robe-in-charge' ? 'robe' : 'folder');
    setSelectedClasses(teacher.assignedClasses || []);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeacher = () => {
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

  const handleAssignClasses = (teacher: any) => {
    setCurrentTeacher(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setIsClassAssignDialogOpen(true);
  };

  const saveClassAssignments = () => {
    if (!currentTeacher) return;
    
    // Update in the UI
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === currentTeacher.id 
        ? { ...teacher, assignedClasses: selectedClasses } 
        : teacher
    );
    
    setTeachers(updatedTeachers);
    
    // Update in storage
    const allTeachers = getAllTeachers();
    const index = parseInt(currentTeacher.id) - 1;
    
    if (index >= 0 && index < allTeachers.length && selectedClasses.length > 0) {
      allTeachers[index] = {
        ...allTeachers[index],
        "Programme Name": selectedClasses[0] // Use first selected class as programme name
      };
      
      updateTeachersList(allTeachers);
    }
    
    toast({
      title: "Classes Assigned",
      description: `Updated class assignments for ${currentTeacher.name}`,
    });
    
    setIsClassAssignDialogOpen(false);
  };

  return {
    teachers,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isClassAssignDialogOpen,
    setIsClassAssignDialogOpen,
    currentTeacher,
    newTeacherName,
    setNewTeacherName,
    newTeacherEmail,
    setNewTeacherEmail,
    newTeacherRole,
    setNewTeacherRole,
    emailType,
    setEmailType,
    availableClasses,
    selectedClasses,
    setSelectedClasses,
    handleAddTeacher,
    handleEditTeacher,
    handleUpdateTeacher,
    handleDeleteTeacher,
    handleAssignClasses,
    saveClassAssignments
  };
};
