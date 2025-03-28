
import React, { useState, useEffect } from 'react';
import { Check, X, Search, ChevronDown, AlertTriangle, Loader2, Clock, Award, UserX } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Student, FilterOption, AttendanceStage, StudentFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import Pagination from '@/components/common/Pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';

interface StudentTableProps {
  role: 'robe-in-charge' | 'folder-in-charge' | 'presenter' | 'super-admin';
  robeTab?: 'slot1' | 'slot2';
}

const StudentTable: React.FC<StudentTableProps> = ({ role, robeTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [attendanceStage, setAttendanceStage] = useState<AttendanceStage>('all');
  const [activeRobeTab, setActiveRobeTab] = useState<'slot1' | 'slot2'>(robeTab || 'slot1');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // Fixed page size
  
  const { 
    students, 
    totalStudents,
    totalPages,
    isLoading, 
    updateStudentStatus, 
    filterOptions,
    needsSync,
    applyFilters,
    isWithinTimeWindow
  } = useStudents();
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Apply filters when any filter changes
  useEffect(() => {
    const filters: StudentFilters = {
      query: searchQuery,
      location: locationFilter,
      school: schoolFilter,
      department: departmentFilter,
      section: sectionFilter,
      attendanceStage,
      page: currentPage,
      pageSize
    };
    
    applyFilters(filters);
  }, [
    searchQuery, 
    locationFilter, 
    schoolFilter, 
    departmentFilter, 
    sectionFilter, 
    attendanceStage, 
    currentPage, 
    pageSize,
    applyFilters
  ]);

  // Set the appropriate attendance stage based on the role and robeTab
  useEffect(() => {
    if (role === 'robe-in-charge') {
      setAttendanceStage(activeRobeTab === 'slot1' ? 'robeSlot1' : 'robeSlot1Completed');
    } else if (role === 'folder-in-charge') {
      setAttendanceStage('bothRobeSlotsCompleted');
    } else if (role === 'presenter') {
      setAttendanceStage('folderCompleted');
    } else {
      setAttendanceStage('all');
    }
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [role, activeRobeTab]);

  // Update activeRobeTab when robeTab prop changes
  useEffect(() => {
    if (robeTab) {
      setActiveRobeTab(robeTab);
    }
  }, [robeTab]);

  const locationOptions = filterOptions?.location || [];
  const schoolOptions = filterOptions?.school || [];
  const departmentOptions = filterOptions?.department || [];
  const sectionOptions = filterOptions?.section || [];

  const handleStatusUpdate = (
    studentId: string, 
    statusType: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    currentValue: boolean
  ) => {
    // Check if within time window for non-super-admin users
    if (role !== 'super-admin' && !isWithinTimeWindow(role)) {
      toast({
        title: "Outside operating hours",
        description: "You cannot make changes at this time. Please try during the designated hours.",
        variant: "destructive"
      });
      return;
    }
    
    // Check if attendance and not super-admin
    if (statusType === 'attendance' && user?.role !== 'super-admin') {
      toast({
        title: "Permission denied",
        description: "Only super admins can modify attendance.",
        variant: "destructive"
      });
      return;
    }
    
    // Update status
    updateStudentStatus(studentId, statusType, !currentValue);
  };

  const clearFilters = () => {
    setLocationFilter('');
    setSchoolFilter('');
    setDepartmentFilter('');
    setSectionFilter('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of table when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sort students based on role needs
  const sortedStudents = [...students].sort((a, b) => {
    // For folder-in-charge: Show absentees first
    if (role === 'folder-in-charge') {
      // First prioritize by absence in robe slot 1
      if (!a.robeSlot1 && b.robeSlot1) return -1;
      if (a.robeSlot1 && !b.robeSlot1) return 1;
      
      // Then by absence in robe slot 2
      if (!a.robeSlot2 && b.robeSlot2) return -1;
      if (a.robeSlot2 && !b.robeSlot2) return 1;
    }
    
    // For presenter: Show rank holders and gold medalists first
    if (role === 'presenter') {
      if (a.isGoldMedalist && !b.isGoldMedalist) return -1;
      if (!a.isGoldMedalist && b.isGoldMedalist) return 1;
      if (a.isRankHolder && !b.isRankHolder) return -1;
      if (!a.isRankHolder && b.isRankHolder) return 1;
    }
    
    // Default sort by name
    return a.name.localeCompare(b.name);
  });

  // Loading state for the table
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-pulse flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-convocation-300 mb-4" />
          <div className="h-4 w-40 bg-convocation-100 rounded mb-2"></div>
          <div className="h-3 w-32 bg-convocation-100 rounded"></div>
        </div>
      </div>
    );
  }

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
      
      {/* Time window restriction message */}
      {role !== 'super-admin' && !isWithinTimeWindow(role) && (
        <div className="bg-convocation-error/10 border border-convocation-error/20 rounded-md p-4 flex items-center gap-3 text-convocation-error mb-4">
          <Clock className="h-5 w-5" />
          <div className="flex-1">
            <h4 className="font-medium">Outside operating hours</h4>
            <p className="text-sm">
              You can only view records at this time. Editing is restricted to the designated operating hours.
            </p>
          </div>
        </div>
      )}
      
      {/* Robe stage tabs for robe-in-charge, only when not used in Dashboard with robeTab prop */}
      {role === 'robe-in-charge' && !robeTab && (
        <div className="flex gap-2 mb-4">
          <Button 
            variant={activeRobeTab === 'slot1' ? 'default' : 'outline'} 
            onClick={() => setActiveRobeTab('slot1')}
            className="transition-normal"
          >
            Robe Attendance
          </Button>
          <Button 
            variant={activeRobeTab === 'slot2' ? 'default' : 'outline'} 
            onClick={() => setActiveRobeTab('slot2')}
            className="transition-normal"
          >
            Parade Attendance
          </Button>
        </div>
      )}
      
      {/* Display information about filtered students */}
      <div className="bg-convocation-50 p-4 rounded-md border border-convocation-100 mb-4">
        <h3 className="font-medium mb-2">
          {role === 'robe-in-charge' && activeRobeTab === 'slot1' && "Robe Attendance"}
          {role === 'robe-in-charge' && activeRobeTab === 'slot2' && "Parade Attendance (Students who attended Robe)"}
          {role === 'folder-in-charge' && "Folder Distribution (Students who completed both attendances)"}
          {role === 'presenter' && "Presentation (Students who completed all previous steps)"}
          {role === 'super-admin' && "All Students"}
        </h3>
        <p className="text-sm text-convocation-400">
          {role === 'robe-in-charge' && activeRobeTab === 'slot1' && 
            "Mark students who are present to collect their robes."}
          {role === 'robe-in-charge' && activeRobeTab === 'slot2' && 
            `Showing students who completed Robe attendance. Mark their attendance for Parade.`}
          {role === 'folder-in-charge' && 
            `Showing students who completed both attendances. Mark students who have collected their folders.`}
          {role === 'presenter' && 
            `Showing students who have completed all previous steps. Mark students who have been presented.`}
          {role === 'super-admin' && 
            `Showing students with their current progress through the graduation process.`}
        </p>
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
                {role === 'robe-in-charge' && activeRobeTab === 'slot1' && (
                  <TableHead>Robe Attendance</TableHead>
                )}
                {role === 'robe-in-charge' && activeRobeTab === 'slot2' && (
                  <TableHead>Parade Attendance</TableHead>
                )}
                {role === 'super-admin' && (
                  <>
                    <TableHead>Robe Attendance</TableHead>
                    <TableHead>Parade Attendance</TableHead>
                    <TableHead>Folder Given</TableHead>
                    <TableHead>Presented</TableHead>
                  </>
                )}
                {role === 'folder-in-charge' && <TableHead>Folder</TableHead>}
                {role === 'presenter' && <TableHead>Presented</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStudents.length > 0 ? (
                sortedStudents.map((student, index) => {
                  // Determine row highlight class based on student status
                  const isAbsentee = !student.robeSlot1 || !student.robeSlot2;
                  const isGoldMedalist = student.isGoldMedalist;
                  const isRankHolder = student.isRankHolder && !student.isGoldMedalist;
                  
                  let rowClass = 'hover:bg-convocation-50 transition-normal';
                  
                  // Apply highlight classes
                  if (isAbsentee && (role === 'folder-in-charge' || role === 'super-admin')) {
                    rowClass = 'bg-red-50 hover:bg-red-100 transition-normal';
                  } else if (isGoldMedalist) {
                    rowClass = 'bg-amber-50 hover:bg-amber-100 transition-normal';
                  } else if (isRankHolder) {
                    rowClass = 'bg-gray-100 hover:bg-gray-200 transition-normal';
                  }
                  
                  return (
                    <TableRow 
                      key={student.id} 
                      className={rowClass}
                    >
                      <TableCell className="font-medium">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {student.name}
                          {student.isGoldMedalist && (
                            <Badge className="ml-1 bg-amber-500">
                              <Award className="h-3 w-3 mr-1" />
                              Gold Medalist
                            </Badge>
                          )}
                          {student.isRankHolder && !student.isGoldMedalist && (
                            <Badge className="ml-1 bg-blue-500">
                              <Award className="h-3 w-3 mr-1" />
                              Rank Holder
                            </Badge>
                          )}
                          {isAbsentee && (role === 'folder-in-charge' || role === 'super-admin') && (
                            <Badge variant="destructive" className="ml-1">
                              <UserX className="h-3 w-3 mr-1" />
                              Absentee
                            </Badge>
                          )}
                        </div>
                      </TableCell>
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
                      {role === 'robe-in-charge' && activeRobeTab === 'slot1' && (
                        <TableCell>
                          <StatusButton
                            status={student.robeSlot1}
                            onClick={() => handleStatusUpdate(student.id, 'robeSlot1', student.robeSlot1)}
                            disabled={(user?.role !== 'super-admin' && user?.role !== 'robe-in-charge')}
                          />
                        </TableCell>
                      )}
                      {role === 'robe-in-charge' && activeRobeTab === 'slot2' && (
                        <TableCell>
                          <StatusButton
                            status={student.robeSlot2}
                            onClick={() => handleStatusUpdate(student.id, 'robeSlot2', student.robeSlot2)}
                            disabled={(user?.role !== 'super-admin' && user?.role !== 'robe-in-charge')}
                          />
                        </TableCell>
                      )}
                      {role === 'super-admin' && (
                        <>
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
                          <TableCell>
                            <StatusButton
                              status={student.hasTakenFolder}
                              onClick={() => handleStatusUpdate(student.id, 'hasTakenFolder', student.hasTakenFolder)}
                              disabled={user?.role !== 'super-admin' && user?.role !== 'folder-in-charge'}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusButton
                              status={student.hasBeenPresented}
                              onClick={() => handleStatusUpdate(student.id, 'hasBeenPresented', student.hasBeenPresented)}
                              disabled={user?.role !== 'super-admin' && user?.role !== 'presenter'}
                            />
                          </TableCell>
                        </>
                      )}
                      {role === 'folder-in-charge' && (
                        <TableCell>
                          <StatusButton
                            status={student.hasTakenFolder}
                            onClick={() => handleStatusUpdate(student.id, 'hasTakenFolder', student.hasTakenFolder)}
                            disabled={(user?.role !== 'super-admin' && user?.role !== 'folder-in-charge')}
                          />
                        </TableCell>
                      )}
                      {role === 'presenter' && (
                        <TableCell>
                          <StatusButton
                            status={student.hasBeenPresented}
                            onClick={() => handleStatusUpdate(student.id, 'hasBeenPresented', student.hasBeenPresented)}
                            disabled={(user?.role !== 'super-admin' && user?.role !== 'presenter')}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
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
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
        totalItems={totalStudents}
        pageSize={pageSize}
      />
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
        <DropdownMenuItem 
          key="all-option" 
          onClick={() => onChange('')} 
          className="cursor-pointer"
        >
          All {label}s
        </DropdownMenuItem>
        {options.length > 0 ? (
          options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={`cursor-pointer ${value === option.value ? 'bg-convocation-50 font-medium' : ''}`}
              onClick={() => onChange(option.value)}
            >
              {option.label}
              {value === option.value && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>No options available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StudentTable;
