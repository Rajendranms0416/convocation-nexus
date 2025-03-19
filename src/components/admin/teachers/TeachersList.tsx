
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TeacherTabContent from './TeacherTabContent';

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

  // Count the number of teachers by role before applying the tab filter
  const robeTeachersCount = filteredTeachers.filter(t => t.role === 'robe-in-charge').length;
  const folderTeachersCount = filteredTeachers.filter(t => t.role === 'folder-in-charge').length;

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
          <TabsTrigger value="robe">Robe In-Charge ({robeTeachersCount})</TabsTrigger>
          <TabsTrigger value="folder">Folder In-Charge ({folderTeachersCount})</TabsTrigger>
        </TabsList>
        
        <TeacherTabContent
          value="all"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search teachers by name, email, role or class..."
          teachers={tabFilteredTeachers}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignClasses={onAssignClasses}
        />
        
        <TeacherTabContent
          value="robe"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search robe-in-charge teachers..."
          teachers={tabFilteredTeachers}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignClasses={onAssignClasses}
        />
        
        <TeacherTabContent
          value="folder"
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Search folder-in-charge teachers..."
          teachers={tabFilteredTeachers}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssignClasses={onAssignClasses}
        />
      </Tabs>
      
      {tabFilteredTeachers.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {tabFilteredTeachers.length} of {teachers.length} teachers
        </div>
      )}
    </div>
  );
};

export default TeachersList;
