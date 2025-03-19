
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import SearchBar from './SearchBar';
import TeachersTable from './TeachersTable';

interface TeacherTabContentProps {
  value: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  placeholder: string;
  teachers: any[];
  onEdit: (teacher: any) => void;
  onDelete: (id: string) => void;
  onAssignClasses: (teacher: any) => void;
}

const TeacherTabContent: React.FC<TeacherTabContentProps> = ({
  value,
  searchTerm,
  setSearchTerm,
  placeholder,
  teachers,
  onEdit,
  onDelete,
  onAssignClasses
}) => {
  return (
    <TabsContent value={value} className="mt-4">
      <div className="space-y-4">
        <SearchBar
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <TeachersTable 
          teachers={teachers} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onAssignClasses={onAssignClasses}
        />
      </div>
    </TabsContent>
  );
};

export default TeacherTabContent;
