
import React, { useState, useEffect } from 'react';
import { Check, X, Search, Loader2, Filter, Clock, AlertTriangle } from 'lucide-react';
import { Student, FilterOption, AttendanceStage, StudentFilters } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Pagination from '@/components/common/Pagination';
import { Card, CardContent } from '@/components/ui/card';

interface MobileStudentTableProps {
  role: 'robe-in-charge' | 'folder-in-charge' | 'presenter' | 'super-admin';
}

const MobileStudentTable: React.FC<MobileStudentTableProps> = ({ role }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [attendanceStage, setAttendanceStage] = useState<AttendanceStage>('all');
  const [activeRobeTab, setActiveRobeTab] = useState<'slot1' | 'slot2'>('slot1');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Set the appropriate attendance stage based on the role
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
    updateStudentStatus(studentId, statusType, !currentValue).then(() => {
      toast({
        title: "Status updated",
        description: `Student ${statusType} has been ${!currentValue ? 'marked' : 'unmarked'}.`,
      });
    });
  };

  const clearFilters = () => {
    setLocationFilter('');
    setSchoolFilter('');
    setDepartmentFilter('');
    setSectionFilter('');
    setSearchQuery('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getStatusTypeByRole = () => {
    if (role === 'robe-in-charge') {
      return activeRobeTab === 'slot1' ? 'robeSlot1' : 'robeSlot2';
    } else if (role === 'folder-in-charge') {
      return 'hasTakenFolder';
    } else if (role === 'presenter') {
      return 'hasBeenPresented';
    }
    return 'attendance';
  };

  // Loading state
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
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-convocation-400" />
          <Input
            placeholder="Search name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full"
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
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" onClick={() => setShowFilters(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filter Students</SheetTitle>
              <SheetDescription>
                Apply filters to find students quickly
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              {role === 'robe-in-charge' && (
                <div className="space-y-2">
                  <Label>Robe Slot</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeRobeTab === 'slot1' ? 'default' : 'outline'} 
                      onClick={() => setActiveRobeTab('slot1')}
                      className="flex-1"
                    >
                      Slot 1
                    </Button>
                    <Button 
                      variant={activeRobeTab === 'slot2' ? 'default' : 'outline'} 
                      onClick={() => setActiveRobeTab('slot2')}
                      className="flex-1"
                    >
                      Slot 2
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Locations</SelectItem>
                    {locationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>School</Label>
                <Select value={schoolFilter} onValueChange={setSchoolFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Schools</SelectItem>
                    {schoolOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departmentOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Section</Label>
                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    {sectionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter || searchQuery) && (
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="w-full mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* Sync status warning when offline changes exist */}
      {needsSync && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs">Changes will sync when your internet connection is restored.</p>
        </div>
      )}
      
      {/* Time window restriction message */}
      {role !== 'super-admin' && !isWithinTimeWindow(role) && (
        <div className="bg-convocation-error/10 border border-convocation-error/20 rounded-md p-3 flex items-center gap-2 text-convocation-error">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">View only. Editing restricted outside operating hours.</p>
        </div>
      )}
      
      {/* Status message */}
      <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
        <h3 className="font-medium text-sm">
          {role === 'robe-in-charge' && activeRobeTab === 'slot1' && "First Robe Attendance"}
          {role === 'robe-in-charge' && activeRobeTab === 'slot2' && "Second Robe Attendance"}
          {role === 'folder-in-charge' && "Folder Distribution"}
          {role === 'presenter' && "Presentation"}
          {role === 'super-admin' && "All Students"}
        </h3>
        <p className="text-xs text-convocation-400 mt-1">
          {students.length} students found
          {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
        </p>
      </div>

      {/* Student list */}
      <div className="space-y-2">
        {students.length > 0 ? (
          students.map((student) => (
            <StudentCard 
              key={student.id} 
              student={student} 
              role={role}
              statusType={getStatusTypeByRole()}
              onStatusUpdate={handleStatusUpdate}
              isDisabled={role !== 'super-admin' && !isWithinTimeWindow(role)}
            />
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-convocation-400">No students found matching your criteria.</p>
            {(searchQuery || locationFilter || schoolFilter || departmentFilter || sectionFilter) && (
              <Button 
                variant="link" 
                onClick={clearFilters}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={handlePageChange} 
        totalItems={totalStudents}
        pageSize={pageSize}
      />
      
      <div className="h-4"></div>
    </div>
  );
};

interface StudentCardProps {
  student: Student;
  role: 'robe-in-charge' | 'folder-in-charge' | 'presenter' | 'super-admin';
  statusType: 'attendance' | 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'robeSlot1' | 'robeSlot2';
  onStatusUpdate: (studentId: string, statusType: any, currentValue: boolean) => void;
  isDisabled: boolean;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  role, 
  statusType, 
  onStatusUpdate,
  isDisabled
}) => {
  // Get status value based on status type
  const getStatusValue = () => {
    switch (statusType) {
      case 'attendance': return student.attendance;
      case 'hasTakenRobe': return student.hasTakenRobe;
      case 'hasTakenFolder': return student.hasTakenFolder;
      case 'hasBeenPresented': return student.hasBeenPresented;
      case 'robeSlot1': return student.robeSlot1;
      case 'robeSlot2': return student.robeSlot2;
      default: return false;
    }
  };
  
  const statusValue = getStatusValue();
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{student.name}</h3>
            <div className="flex items-center mt-1">
              <code className="px-1 py-0.5 rounded bg-convocation-100 text-xs mr-2">
                {student.registrationNumber}
              </code>
              <span className="text-xs text-convocation-400 truncate">
                {student.department}
              </span>
            </div>
          </div>
          <Button
            variant={statusValue ? "default" : "outline"}
            size="sm"
            className={`min-w-20 ml-2 ${
              statusValue 
                ? 'bg-convocation-success hover:bg-convocation-success/90' 
                : 'border-convocation-error text-convocation-error hover:bg-convocation-error/10'
            }`}
            onClick={() => onStatusUpdate(student.id, statusType, statusValue)}
            disabled={isDisabled}
          >
            {statusValue ? (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileStudentTable;
