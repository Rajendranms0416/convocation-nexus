
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import TeacherTableRow from './TeacherTableRow';

interface TeachersTableProps {
  teachers: any[];
  onEdit: (teacher: any) => void;
  onDelete: (id: string) => void;
  onAssignClasses: (teacher: any) => void;
}

const TeachersTable: React.FC<TeachersTableProps> = ({ 
  teachers, 
  onEdit, 
  onDelete, 
  onAssignClasses 
}) => {
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
            <TeacherTableRow
              key={teacher.id}
              teacher={teacher}
              onEdit={onEdit}
              onDelete={onDelete}
              onAssignClasses={onAssignClasses}
            />
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

export default TeachersTable;
