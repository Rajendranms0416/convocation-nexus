
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Role } from '@/types';
import { X, Check, UserPlus, Mail, Edit, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface TeacherData {
  "Sl. No": number;
  "Programme Name": string | null;
  "Class Wise/\nSection Wise": string | null;
  "HOD/Coordinator": string | null;
  "Accompanying Teacher": string | null;
  "Robe Email ID": string | null;
  "Folder Email ID": string | null;
  "Folder in Charge": string | null;
}

const RoleAssignment: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('robe-in-charge');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);

  useEffect(() => {
    // Redirect if not admin or still loading
    if (!isLoading && (!isAuthenticated || (user && user.role !== 'super-admin'))) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate, toast, user]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('Teacher\'s List')
        .select('*');
      
      if (error) throw error;
      
      setTeachers(data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load teacher data',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Format email for storage
      const formattedEmail = email.trim().toLowerCase();
      
      if (isEditing && editingTeacherId) {
        // Update existing teacher
        const updateData: any = {};
        
        if (role === 'robe-in-charge') {
          updateData["Robe Email ID"] = formattedEmail;
          updateData["Accompanying Teacher"] = name;
        } else if (role === 'folder-in-charge') {
          updateData["Folder Email ID"] = formattedEmail;
          updateData["Folder in Charge"] = name;
        }
        
        const { error } = await supabase
          .from('Teacher\'s List')
          .update(updateData)
          .eq('Sl. No', editingTeacherId);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Teacher updated successfully',
        });
      } else {
        // Create new teacher entry
        const newTeacher: any = {
          "Programme Name": "Added Manually", 
          "Class Wise/\nSection Wise": null,
          "HOD/Coordinator": null,
        };
        
        if (role === 'robe-in-charge') {
          newTeacher["Robe Email ID"] = formattedEmail;
          newTeacher["Accompanying Teacher"] = name;
          newTeacher["Folder Email ID"] = null;
          newTeacher["Folder in Charge"] = null;
        } else if (role === 'folder-in-charge') {
          newTeacher["Folder Email ID"] = formattedEmail;
          newTeacher["Folder in Charge"] = name;
          newTeacher["Robe Email ID"] = null;
          newTeacher["Accompanying Teacher"] = null;
        }
        
        // Get max Sl. No to assign next number
        const maxSlNo = teachers.length > 0 
          ? Math.max(...teachers.map(t => t["Sl. No"]))
          : 0;
          
        newTeacher["Sl. No"] = maxSlNo + 1;
        
        const { error } = await supabase
          .from('Teacher\'s List')
          .insert(newTeacher);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Teacher added successfully',
        });
      }
      
      // Reset form
      setEmail('');
      setName('');
      setRole('robe-in-charge');
      setIsEditing(false);
      setEditingTeacherId(null);
      
      // Refresh teacher list
      fetchTeachers();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save teacher',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: TeacherData) => {
    setIsEditing(true);
    setEditingTeacherId(teacher["Sl. No"]);
    
    if (teacher["Robe Email ID"]) {
      setEmail(teacher["Robe Email ID"] || '');
      setName(teacher["Accompanying Teacher"] || '');
      setRole('robe-in-charge');
    } else if (teacher["Folder Email ID"]) {
      setEmail(teacher["Folder Email ID"] || '');
      setName(teacher["Folder in Charge"] || '');
      setRole('folder-in-charge');
    }
  };

  const handleDelete = async (slNo: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    
    try {
      const { error } = await supabase
        .from('Teacher\'s List')
        .delete()
        .eq('Sl. No', slNo);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Teacher deleted successfully',
      });
      
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete teacher',
        variant: 'destructive',
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingTeacherId(null);
    setEmail('');
    setName('');
    setRole('robe-in-charge');
  };

  return (
    <div className="min-h-screen bg-convocation-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg glass-card animate-fade-in mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">Teacher Role Assignment</CardTitle>
                <CardDescription>
                  Assign roles to teachers for the convocation system
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="add">Add/Edit Teachers</TabsTrigger>
                <TabsTrigger value="view">View All Teachers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="add" className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white/50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      {isEditing ? 'Edit Teacher' : 'Add New Teacher'}
                    </h3>
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        <X className="mr-1 h-4 w-4" /> Cancel
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Teacher Name</Label>
                      <Input 
                        id="name" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter teacher name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="firstname.lastname@convocation.edu"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Assign Role</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          className="radio"
                          checked={role === 'robe-in-charge'}
                          onChange={() => setRole('robe-in-charge')}
                        />
                        <span>Robe In-charge</span>
                      </label>
                      
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="role"
                          className="radio"
                          checked={role === 'folder-in-charge'}
                          onChange={() => setRole('folder-in-charge')}
                        />
                        <span>Folder In-charge</span>
                      </label>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        {isEditing ? <Edit className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isEditing ? 'Update Teacher' : 'Add Teacher'}
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="view">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Program</TableHead>
                        <TableHead>Robe In-charge</TableHead>
                        <TableHead>Folder In-charge</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teachers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No teachers found
                          </TableCell>
                        </TableRow>
                      ) : (
                        teachers.map((teacher) => (
                          <TableRow key={teacher["Sl. No"]}>
                            <TableCell className="font-medium">
                              {teacher["Programme Name"] || "N/A"}
                              <div className="text-xs text-muted-foreground mt-1">
                                {teacher["Class Wise/\nSection Wise"] || ""}
                              </div>
                            </TableCell>
                            <TableCell>
                              {teacher["Accompanying Teacher"] ? (
                                <div>
                                  <div className="font-medium">{teacher["Accompanying Teacher"]}</div>
                                  <div className="text-xs flex items-center text-muted-foreground">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {teacher["Robe Email ID"]}
                                  </div>
                                </div>
                              ) : (
                                "Not assigned"
                              )}
                            </TableCell>
                            <TableCell>
                              {teacher["Folder in Charge"] ? (
                                <div>
                                  <div className="font-medium">{teacher["Folder in Charge"]}</div>
                                  <div className="text-xs flex items-center text-muted-foreground">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {teacher["Folder Email ID"]}
                                  </div>
                                </div>
                              ) : (
                                "Not assigned"
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEdit(teacher)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelete(teacher["Sl. No"])}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="border-t pt-6 flex justify-between">
            <div className="text-sm text-muted-foreground">
              <p>Teachers added here will be able to login to the system</p>
              <p>Default password: <span className="font-medium">password123</span></p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RoleAssignment;
