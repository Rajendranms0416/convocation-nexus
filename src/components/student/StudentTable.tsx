
import React, { useState } from 'react';
import { Check, X, Search, ChevronDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student, FilterOption } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StudentTableProps {
  role: 'robe-in-charge' | 'folder-in-charge' | 'presenter' | 'super-admin';
}

const StudentTable: React.FC<StudentTableProps> = ({ role }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  
  const { students, isLoading, updateStudentStatus, filterStudents, getFilterOptions } = useStudents();
  const { user } = useAuth();

  const locationOptions = getFilterOptions('location');
  const schoolOptions = getFilterOptions('school');
  const departmentOptions = getFilterOptions('department');
  const sectionOptions = getFilterOptions('section');

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

  const filteredStudents = filterStudents(
    searchQuery,
    locationFilter,
    schoolFilter,
    departmentFilter,
    sectionFilter
  );

  // Determine which columns to show based on role
  const canManageRobes = ['robe-in-charge', 'super-admin'].includes(role);
  const canManageFolders = ['folder-in-charge', 'super-admin'].includes(role);
  const canManagePresentation = ['presenter', 'super-admin'].includes(role);

  const handleStatusUpdate = (
    studentId: string, 
    statusType: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    currentValue: boolean
  ) => {
    // Super admin should be able to update any status, others can only update their respective statuses
    if (
      user?.role === 'super-admin' || 
      (statusType === 'hasTakenRobe' && user?.role === 'robe-in-charge') ||
      ((statusType === 'robeSlot1' || statusType === 'robeSlot2') && user?.role === 'robe-in-charge') ||
      (statusType === 'hasTakenFolder' && user?.role === 'folder-in-charge') ||
      (statusType === 'hasBeenPresented' && user?.role === 'presenter')
    ) {
      updateStudentStatus(studentId, statusType, !currentValue);
    }
  };

  const clearFilters = () => {
    setLocationFilter('');
    setSchoolFilter('');
    setDepartmentFilter('');
    setSectionFilter('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
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
        
        <div className="flex flex-wrap gap-2">
          <FilterDropdown 
            label="Location" 
            options={locationOptions} 
            value={locationFilter} 
            onChange={setLocationFilter} 
          />
          <FilterDropdown 
            label="School" 
            options={schoolOptions} 
            value={schoolFilter} 
            onChange={setSchoolFilter} 
          />
          <FilterDropdown 
            label="Department" 
            options={departmentOptions} 
            value={departmentFilter} 
            onChange={setDepartmentFilter} 
          />
          <FilterDropdown 
            label="Section" 
            options={sectionOptions} 
            value={sectionFilter} 
            onChange={setSectionFilter} 
          />
          
          {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs h-9"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-md border border-convocation-100 bg-white overflow-hidden">
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-convocation-50">
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Attendance</TableHead>
                {canManageRobes && (
                  <>
                    <TableHead>Robe</TableHead>
                    <TableHead>Slot 1</TableHead>
                    <TableHead>Slot 2</TableHead>
                  </>
                )}
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
                        {student.school}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate" title={student.department}>
                      {student.department}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="whitespace-nowrap">
                        Section {student.section}
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
                      <>
                        <TableCell>
                          <StatusButton
                            status={student.hasTakenRobe}
                            onClick={() => handleStatusUpdate(student.id, 'hasTakenRobe', student.hasTakenRobe)}
                            disabled={user?.role !== 'super-admin' && user?.role !== 'robe-in-charge'}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusButton
                            status={student.robeSlot1}
                            onClick={() => handleStatusUpdate(student.id, 'robeSlot1', student.robeSlot1)}
                            disabled={user?.role !== 'super-admin' && user?.role !== 'robe-in-charge'}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusButton
                            status={student.robeSlot2}
                            onClick={() => handleStatusUpdate(student.id, 'robeSlot2', student.robeSlot2)}
                            disabled={user?.role !== 'super-admin' && user?.role !== 'robe-in-charge'}
                          />
                        </TableCell>
                      </>
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
                  <TableCell colSpan={12} className="h-24 text-center">
                    No students found matching your criteria.
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
    className={`w-20 transition-normal ${
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

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`text-xs h-9 ${value ? 'border-convocation-accent text-convocation-accent' : ''}`}>
          {label}
          {value ? `: ${value}` : ''}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto" align="end">
        {options.length > 0 ? (
          <>
            <DropdownMenuItem onClick={() => onChange('')} className="cursor-pointer">
              All {label}s
            </DropdownMenuItem>
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                className={`cursor-pointer ${value === option.value ? 'bg-convocation-50 font-medium' : ''}`}
                onClick={() => onChange(option.value)}
              >
                {option.label}
                {value === option.value && <Check className="ml-auto h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <DropdownMenuItem disabled>No options available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StudentTable;
