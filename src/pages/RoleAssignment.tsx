
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckIcon, PencilIcon, Trash2Icon, PlusCircleIcon, UserPlusIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User, Role } from '@/types';

const RoleAssignment: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClassAssignDialogOpen, setIsClassAssignDialogOpen] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<any>(null);
  
  // Form states
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState<Role>('presenter');
  
  // Class assignment states
  const [availableClasses, setAvailableClasses] = useState([
    'BCA 1st Year', 'BCA 2nd Year', 'BCA 3rd Year',
    'MCA 1st Year', 'MCA 2nd Year', 
    'BCom 1st Year', 'BCom 2nd Year', 'BCom 3rd Year',
    'MBA 1st Year', 'MBA 2nd Year'
  ]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Check if user is super admin, otherwise redirect
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role !== 'super-admin') {
        toast({
          title: "Access Denied",
          description: "Only super admins can access this page",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    } else if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, user, navigate, toast]);

  // Load teacher data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // Fetch data from the Teacher's List table
        const { data, error } = await supabase
          .from('Teacher\'s List')
          .select('*');
        
        if (error) throw error;
        
        if (data) {
          // Transform the data to a more usable format
          const formattedTeachers = data.map(teacher => ({
            id: teacher['Sl. No'].toString(),
            name: teacher['Accompanying Teacher'] || teacher['Folder in Charge'] || 'Unknown',
            email: teacher['Robe Email ID'] || teacher['Folder Email ID'] || '',
            role: teacher['Robe Email ID'] ? 'robe-in-charge' : 'folder-in-charge',
            program: teacher['Programme Name'] || '',
            section: teacher['Class Wise/\nSection Wise'] || '',
            assignedClasses: [teacher['Programme Name'] || '']
          }));
          
          setTeachers(formattedTeachers);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast({
          title: "Failed to load data",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    };
    
    if (isAuthenticated && user?.role === 'super-admin') {
      fetchTeachers();
    }
  }, [isAuthenticated, user, toast]);

  const handleAddTeacher = async () => {
    if (!newTeacherName || !newTeacherEmail || !newTeacherRole) {
      toast({
        title: "Invalid Input",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    const newTeacher = {
      id: (teachers.length + 1).toString(),
      name: newTeacherName,
      email: newTeacherEmail,
      role: newTeacherRole,
      assignedClasses: []
    };
    
    // In a real app, we would save to the database
    setTeachers([...teachers, newTeacher]);
    
    toast({
      title: "Teacher Added",
      description: `${newTeacherName} has been added as ${newTeacherRole}`,
    });
    
    // Reset form and close dialog
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherRole('presenter');
    setIsAddDialogOpen(false);
  };

  const handleEditTeacher = (teacher: any) => {
    setCurrentTeacher(teacher);
    setNewTeacherName(teacher.name);
    setNewTeacherEmail(teacher.email);
    setNewTeacherRole(teacher.role);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeacher = () => {
    if (!currentTeacher) return;
    
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === currentTeacher.id 
        ? { 
            ...teacher, 
            name: newTeacherName, 
            email: newTeacherEmail, 
            role: newTeacherRole 
          } 
        : teacher
    );
    
    setTeachers(updatedTeachers);
    
    toast({
      title: "Teacher Updated",
      description: `${newTeacherName}'s information has been updated`,
    });
    
    setIsEditDialogOpen(false);
  };

  const handleDeleteTeacher = (id: string) => {
    const updatedTeachers = teachers.filter(teacher => teacher.id !== id);
    setTeachers(updatedTeachers);
    
    toast({
      title: "Teacher Removed",
      description: "The teacher has been removed from the system",
    });
  };

  const handleAssignClasses = (teacher: any) => {
    setCurrentTeacher(teacher);
    setSelectedClasses(teacher.assignedClasses || []);
    setIsClassAssignDialogOpen(true);
  };

  const toggleClassSelection = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const saveClassAssignments = () => {
    if (!currentTeacher) return;
    
    const updatedTeachers = teachers.map(teacher => 
      teacher.id === currentTeacher.id 
        ? { ...teacher, assignedClasses: selectedClasses } 
        : teacher
    );
    
    setTeachers(updatedTeachers);
    
    toast({
      title: "Classes Assigned",
      description: `Updated class assignments for ${currentTeacher.name}`,
    });
    
    setIsClassAssignDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
          <div className="h-4 w-48 rounded bg-convocation-100"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Teacher Role Management</CardTitle>
              <CardDescription>
                Assign roles and classes to teachers for the convocation
              </CardDescription>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline">
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-6">
            <h3 className="text-lg font-medium">
              Manage Teachers ({teachers.length})
            </h3>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Teacher</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new teacher
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherName">Name</Label>
                    <Input 
                      id="teacherName" 
                      value={newTeacherName}
                      onChange={(e) => setNewTeacherName(e.target.value)}
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teacherEmail">Email</Label>
                    <Input 
                      id="teacherEmail" 
                      type="email"
                      value={newTeacherEmail}
                      onChange={(e) => setNewTeacherEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teacherRole">Role</Label>
                    <Select 
                      value={newTeacherRole} 
                      onValueChange={(value) => setNewTeacherRole(value as Role)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="robe-in-charge">Robe In-charge</SelectItem>
                        <SelectItem value="folder-in-charge">Folder In-charge</SelectItem>
                        <SelectItem value="presenter">Presenter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTeacher}>
                    Add Teacher
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Table>
            <TableCaption>List of teachers with their assigned roles</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell>{teacher.id}</TableCell>
                  <TableCell className="font-medium">{teacher.name}</TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      teacher.role === 'robe-in-charge' 
                        ? 'default' 
                        : teacher.role === 'folder-in-charge' 
                          ? 'secondary' 
                          : 'outline'
                    }>
                      {teacher.role.replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {teacher.assignedClasses && teacher.assignedClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses.slice(0, 2).map((cls: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))}
                        {teacher.assignedClasses.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{teacher.assignedClasses.length - 2} more
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">None assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleAssignClasses(teacher)}
                      >
                        <PlusCircleIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditTeacher(teacher)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Teacher Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update the teacher's information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editTeacherName">Name</Label>
              <Input 
                id="editTeacherName" 
                value={newTeacherName}
                onChange={(e) => setNewTeacherName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editTeacherEmail">Email</Label>
              <Input 
                id="editTeacherEmail" 
                type="email"
                value={newTeacherEmail}
                onChange={(e) => setNewTeacherEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="editTeacherRole">Role</Label>
              <Select 
                value={newTeacherRole} 
                onValueChange={(value) => setNewTeacherRole(value as Role)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="robe-in-charge">Robe In-charge</SelectItem>
                  <SelectItem value="folder-in-charge">Folder In-charge</SelectItem>
                  <SelectItem value="presenter">Presenter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTeacher}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Class Assignment Dialog */}
      <Dialog open={isClassAssignDialogOpen} onOpenChange={setIsClassAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Classes</DialogTitle>
            <DialogDescription>
              {currentTeacher ? `Select classes for ${currentTeacher.name}` : 'Select classes to assign'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 gap-2">
              {availableClasses.map((cls) => (
                <div 
                  key={cls}
                  className={`flex items-center justify-between p-2 rounded-md border cursor-pointer ${
                    selectedClasses.includes(cls) ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-secondary/10'
                  }`}
                  onClick={() => toggleClassSelection(cls)}
                >
                  <span>{cls}</span>
                  {selectedClasses.includes(cls) && (
                    <CheckIcon className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <span className="text-sm text-muted-foreground">
                {selectedClasses.length} classes selected
              </span>
              <div>
                <Button variant="outline" onClick={() => setIsClassAssignDialogOpen(false)} className="mr-2">
                  Cancel
                </Button>
                <Button onClick={saveClassAssignments}>
                  Save
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleAssignment;
