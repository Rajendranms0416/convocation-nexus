
import React, { useState, useEffect } from 'react';
import { Check, X, Search, Loader2, Filter, Clock, AlertTriangle, Award, UserX } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import Pagination from '@/components/common/Pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('robeSlot1');
  
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

  useEffect(() => {
    if (role === 'super-admin') {
      // For super admin, we set the attendance stage based on the active tab
      switch (activeTab) {
        case 'robeSlot1':
          setAttendanceStage('robeSlot1');
          break;
        case 'robeSlot2':
          setAttendanceStage('robeSlot1Completed');
          break;
        case 'folder':
          setAttendanceStage('bothRobeSlotsCompleted');
          break;
        case 'presenter':
          setAttendanceStage('folderCompleted');
          break;
        case 'all':
        default:
          setAttendanceStage('all');
          break;
      }
    } else if (role === 'robe-in-charge') {
      setAttendanceStage(activeRobeTab === 'slot1' ? 'robeSlot1' : 'robeSlot1Completed');
    } else if (role === 'folder-in-charge') {
      setAttendanceStage('bothRobeSlotsCompleted');
    } else if (role === 'presenter') {
      setAttendanceStage('folderCompleted');
    } else {
      setAttendanceStage('all');
    }
    
    setCurrentPage(1);
  }, [role, activeRobeTab, activeTab]);

  const locationOptions = filterOptions?.location || [];
  const schoolOptions = filterOptions?.school || [];
  const departmentOptions = filterOptions?.department || [];
  const sectionOptions = filterOptions?.section || [];

  const handleStatusUpdate = async (
    studentId: string, 
    statusType: 'hasTakenRobe' | 'hasTakenFolder' | 'hasBeenPresented' | 'attendance' | 'robeSlot1' | 'robeSlot2', 
    currentValue: boolean
  ) => {
    if (role !== 'super-admin' && !isWithinTimeWindow(role)) {
      toast({
        title: "Outside operating hours",
        description: "You cannot make changes at this time. Please try during the designated hours.",
        variant: "destructive"
      });
      return;
    }
    
    if (statusType === 'attendance' && user?.role !== 'super-admin') {
      toast({
        title: "Permission denied",
        description: "Only super admins can modify attendance.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await updateStudentStatus(studentId, statusType, !currentValue);
      toast({
        title: "Status updated",
        description: `Student ${statusType} has been ${!currentValue ? 'marked' : 'unmarked'}.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not update student status. Please try again.",
        variant: "destructive"
      });
    }
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getStatusTypeByRole = () => {
    if (role === 'super-admin') {
      // For super admin, the status type depends on the active tab
      switch (activeTab) {
        case 'robeSlot1':
          return 'robeSlot1';
        case 'robeSlot2':
          return 'robeSlot2';
        case 'folder':
          return 'hasTakenFolder';
        case 'presenter':
          return 'hasBeenPresented';
        default:
          return 'attendance';
      }
    } else if (role === 'robe-in-charge') {
      return activeRobeTab === 'slot1' ? 'robeSlot1' : 'robeSlot2';
    } else if (role === 'folder-in-charge') {
      return 'hasTakenFolder';
    } else if (role === 'presenter') {
      return 'hasBeenPresented';
    }
    return 'attendance';
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

  const renderSuperAdminTabs = () => {
    return (
      <Tabs 
        defaultValue="robeSlot1" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-5 w-full mb-4">
          <TabsTrigger value="robeSlot1">Robe</TabsTrigger>
          <TabsTrigger value="robeSlot2">Parade</TabsTrigger>
          <TabsTrigger value="folder">Folder</TabsTrigger>
          <TabsTrigger value="presenter">Present</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="robeSlot1" className="mt-0">
          <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
            <h3 className="font-medium text-sm">Robe Attendance</h3>
            <p className="text-xs text-convocation-400 mt-1">
              {students.length} students found
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="robeSlot2" className="mt-0">
          <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
            <h3 className="font-medium text-sm">Parade Attendance</h3>
            <p className="text-xs text-convocation-400 mt-1">
              {students.length} students found
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="folder" className="mt-0">
          <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
            <h3 className="font-medium text-sm">Folder Distribution</h3>
            <p className="text-xs text-convocation-400 mt-1">
              {students.length} students found
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="presenter" className="mt-0">
          <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
            <h3 className="font-medium text-sm">Presentation Status</h3>
            <p className="text-xs text-convocation-400 mt-1">
              {students.length} students found
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
            <h3 className="font-medium text-sm">All Students</h3>
            <p className="text-xs text-convocation-400 mt-1">
              {students.length} students found
              {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    );
  };

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
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filter Students</SheetTitle>
              <SheetDescription>
                Apply filters to find students quickly
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              {role === 'robe-in-charge' && (
                <div className="space-y-2">
                  <Label>Attendance Type</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={activeRobeTab === 'slot1' ? 'default' : 'outline'} 
                      onClick={() => setActiveRobeTab('slot1')}
                      className="flex-1"
                    >
                      Robe
                    </Button>
                    <Button 
                      variant={activeRobeTab === 'slot2' ? 'default' : 'outline'} 
                      onClick={() => setActiveRobeTab('slot2')}
                      className="flex-1"
                    >
                      Parade
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
                    <SelectItem value="all">All Locations</SelectItem>
                    {locationOptions && locationOptions.length > 0 && locationOptions.map(option => (
                      <SelectItem key={option.value} value={option.value || "default"}>
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
                    <SelectItem value="all">All Schools</SelectItem>
                    {schoolOptions && schoolOptions.length > 0 && schoolOptions.map(option => (
                      <SelectItem key={option.value} value={option.value || "default"}>
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
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions && departmentOptions.length > 0 && departmentOptions.map(option => (
                      <SelectItem key={option.value} value={option.value || "default"}>
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
                    <SelectItem value="all">All Sections</SelectItem>
                    {sectionOptions && sectionOptions.length > 0 && sectionOptions.map(option => (
                      <SelectItem key={option.value} value={option.value || "default"}>
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

              <Button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full mt-4"
              >
                Apply Filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      
      {role !== 'super-admin' && !isWithinTimeWindow(role) && (
        <div className="bg-convocation-error/10 border border-convocation-error/20 rounded-md p-3 flex items-center gap-2 text-convocation-error">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <p className="text-xs">View only. Editing restricted outside operating hours.</p>
        </div>
      )}
      
      {role === 'super-admin' ? (
        renderSuperAdminTabs()
      ) : (
        <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
          <h3 className="font-medium text-sm">
            {role === 'robe-in-charge' && activeRobeTab === 'slot1' && "Robe Attendance"}
            {role === 'robe-in-charge' && activeRobeTab === 'slot2' && "Parade Attendance"}
            {role === 'folder-in-charge' && "Folder Distribution"}
            {role === 'presenter' && "Presentation"}
          </h3>
          <p className="text-xs text-convocation-400 mt-1">
            {students.length} students found
            {(locationFilter || schoolFilter || departmentFilter || sectionFilter) && " with applied filters"}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {sortedStudents.length > 0 ? (
          sortedStudents.map((student) => (
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
  
  // Determine if student has special status
  const isAbsentee = !student.robeSlot1 || !student.robeSlot2;
  const isSpecial = student.isGoldMedalist || student.isRankHolder;
  
  // Customize card background based on student status
  const cardBg = 
    (isAbsentee && role === 'folder-in-charge') ? 'bg-red-50 border-red-200' :
    (isSpecial && role === 'presenter') ? 'bg-amber-50 border-amber-200' :
    '';
  
  return (
    <Card className={`overflow-hidden ${cardBg}`}>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1">
              <h3 className="font-medium truncate">{student.name}</h3>
              {student.isGoldMedalist && (
                <Badge className="bg-amber-500">
                  <Award className="h-3 w-3 mr-1" />
                  Gold
                </Badge>
              )}
              {student.isRankHolder && !student.isGoldMedalist && (
                <Badge className="bg-blue-500">
                  <Award className="h-3 w-3 mr-1" />
                  Rank
                </Badge>
              )}
              {isAbsentee && role === 'folder-in-charge' && (
                <Badge variant="destructive">
                  <UserX className="h-3 w-3 mr-1" />
                  Absent
                </Badge>
              )}
            </div>
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
