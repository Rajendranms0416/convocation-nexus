
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PencilIcon, Trash2Icon, PlusCircleIcon } from 'lucide-react';

interface TeacherTableRowProps {
  teacher: any;
  onEdit: (teacher: any) => void;
  onDelete: (id: string) => void;
  onAssignClasses: (teacher: any) => void;
}

const TeacherTableRow: React.FC<TeacherTableRowProps> = ({ 
  teacher, 
  onEdit, 
  onDelete, 
  onAssignClasses 
}) => {
  return (
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
  );
};

export default TeacherTableRow;
