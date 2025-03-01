
import React, { useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface StudentTableProps {
  role: 'robe-in-charge' | 'folder-in-charge' | 'presenter' | 'super-admin';
}

const StudentTable: React.FC<StudentTableProps> = ({ role }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { students, isLoading, updateStudentStatus, filterStudents } = useStudents();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-convocation-100 rounded-full mb-4"></div>
          <div className="h-4 w-40 bg-convocation-100 rounded mb-2"></div>
          <div className="h-3 w-32 bg-convocation-100 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredStudents = filterStudents(searchQuery);

  // Determine which columns to show based on role
  const canManageRobes = ['robe-in-charge', 'super-admin'].includes(role);
  const canManageFolders = ['folder-in-charge', 'super-admin'].includes(role);
  const canManagePresentation = ['presenter', 'super-admin'].includes(role);

  const handleStatusUpdate = (
    studentId: string, 
    statusType: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance', 
    currentValue: boolean
  ) => {
    // Super admin should be able to update any status, others can only update their respective statuses
    if (
      user?.role === 'super-admin' || 
      (statusType === 'hasTakenRobe' && user?.role === 'robe-in-charge') ||
      (statusType === 'hasTakenFolder' && user?.role === 'folder-in-charge') ||
      (statusType === 'hasBeenPresented' && user?.role === 'presenter')
    ) {
      updateStudentStatus(studentId, statusType, !currentValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-convocation-400" />
        <Input
          placeholder="Search by name or registration number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-full transition-normal"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchQuery('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="rounded-md border border-convocation-100 bg-white overflow-hidden">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-convocation-50">
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Attendance</TableHead>
                {canManageRobes && <TableHead>Robe</TableHead>}
                {canManageFolders && <TableHead>Folder</TableHead>}
                {canManagePresentation && <TableHead>Presented</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-convocation-50 transition-normal">
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <code className="px-1 py-0.5 rounded bg-convocation-100 text-xs">
                        {student.registrationNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap">
                        {student.program}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusButton
                        status={student.attendance}
                        onClick={() => handleStatusUpdate(student.id, 'attendance', student.attendance)}
                        disabled={user?.role !== 'super-admin'}
                      />
                    </TableCell>
                    {canManageRobes && (
                      <TableCell>
                        <StatusButton
                          status={student.hasTakenRobe}
                          onClick={() => handleStatusUpdate(student.id, 'hasTakenRobe', student.hasTakenRobe)}
                          disabled={user?.role !== 'super-admin' && user?.role !== 'robe-in-charge'}
                        />
                      </TableCell>
                    )}
                    {canManageFolders && (
                      <TableCell>
                        <StatusButton
                          status={student.hasTakenFolder}
                          onClick={() => handleStatusUpdate(student.id, 'hasTakenFolder', student.hasTakenFolder)}
                          disabled={user?.role !== 'super-admin' && user?.role !== 'folder-in-charge'}
                        />
                      </TableCell>
                    )}
                    {canManagePresentation && (
                      <TableCell>
                        <StatusButton
                          status={student.hasBeenPresented}
                          onClick={() => handleStatusUpdate(student.id, 'hasBeenPresented', student.hasBeenPresented)}
                          disabled={user?.role !== 'super-admin' && user?.role !== 'presenter'}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No students found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="text-sm text-convocation-400 italic">
        Showing {filteredStudents.length} of {students.length} students
      </div>
    </div>
  );
};

interface StatusButtonProps {
  status: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const StatusButton: React.FC<StatusButtonProps> = ({ status, onClick, disabled = false }) => (
  <Button
    variant={status ? "default" : "outline"}
    size="sm"
    className={`w-24 transition-normal ${
      status 
        ? 'bg-convocation-success hover:bg-convocation-success/90' 
        : 'border-convocation-error text-convocation-error hover:bg-convocation-error/10'
    }`}
    onClick={onClick}
    disabled={disabled}
  >
    {status ? (
      <span className="flex items-center">
        <Check className="mr-1 h-4 w-4" />
        Yes
      </span>
    ) : (
      <span className="flex items-center">
        <X className="mr-1 h-4 w-4" />
        No
      </span>
    )}
  </Button>
);

export default StudentTable;
