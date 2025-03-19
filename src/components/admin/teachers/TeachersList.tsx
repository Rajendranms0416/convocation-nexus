
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PencilIcon, Trash2Icon, PlusCircleIcon, SearchIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TeachersListProps {
  teachers: any[];
  onEdit: (teacher: any) => void;
  onDelete: (id: string) => void;
  onAssignClasses: (teacher: any) => void;
}

const TeachersList: React.FC<TeachersListProps> = ({ 
  teachers, 
  onEdit, 
  onDelete, 
  onAssignClasses 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter teachers based on search term
  const filteredTeachers = teachers.filter(teacher => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      (teacher.name && teacher.name.toLowerCase().includes(term)) ||
      (teacher.email && teacher.email.toLowerCase().includes(term)) ||
      (teacher.role && teacher.role.toLowerCase().includes(term)) ||
      (teacher.assignedClasses && 
        teacher.assignedClasses.some((cls: string) => 
          cls.toLowerCase().includes(term)
        ))
    );
  });

  // Filter teachers based on active tab
  const tabFilteredTeachers = filteredTeachers.filter(teacher => {
    if (activeTab === 'all') return true;
    if (activeTab === 'robe') return teacher.role === 'robe-in-charge';
    if (activeTab === 'folder') return teacher.role === 'folder-in-charge';
    return true;
  });

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">All Teachers ({filteredTeachers.length})</TabsTrigger>
          <TabsTrigger value="robe">Robe In-Charge ({filteredTeachers.filter(t => t.role === 'robe-in-charge').length})</TabsTrigger>
          <TabsTrigger value="folder">Folder In-Charge ({filteredTeachers.filter(t => t.role === 'folder-in-charge').length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search teachers by name, email, role or class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <TeachersTable 
              teachers={tabFilteredTeachers} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onAssignClasses={onAssignClasses}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="robe" className="mt-4">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search robe-in-charge teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <TeachersTable 
              teachers={tabFilteredTeachers} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onAssignClasses={onAssignClasses}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="folder" className="mt-4">
          <div className="space-y-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search folder-in-charge teachers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <TeachersTable 
              teachers={tabFilteredTeachers} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onAssignClasses={onAssignClasses}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {tabFilteredTeachers.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {tabFilteredTeachers.length} of {teachers.length} teachers
        </div>
      )}
    </div>
  );
};

// Extract Table component to avoid repetition
const TeachersTable = ({ teachers, onEdit, onDelete, onAssignClasses }) => {
  return (
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
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
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
                    onClick={() => onAssignClasses(teacher)}
                  >
                    <PlusCircleIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onEdit(teacher)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onDelete(teacher.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4 text-gray-500">
              No teachers found matching your search criteria
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default TeachersList;
