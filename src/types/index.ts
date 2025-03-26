
export type Role = 'robe-in-charge' | 'folder-in-charge' | 'super-admin' | 'presenter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  assignedClasses?: string[]; // Added for class assignment
}

export interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  program: string;
  location: string;
  school: string;
  department: string;
  section: string;
  hasTakenRobe: boolean;
  hasTakenFolder: boolean;
  hasBeenPresented: boolean;
  attendance: boolean;
  robeSlot1: boolean;
  robeSlot2: boolean;
  isGoldMedalist?: boolean; // Gold medalist flag for highlighting
  isRankHolder?: boolean; // Rank holder flag for highlighting (silver)
}

export type FilterOption = {
  value: string;
  label: string;
};

export type AttendanceStage = 'all' | 'robeSlot1' | 'robeSlot1Completed' | 'bothRobeSlotsCompleted' | 'folderCompleted';

export interface NetworkStatusProps {
  lastSyncTime: Date | null;
  isOnline: boolean;
  isSyncing: boolean;
  needsSync: boolean;
  onSync: () => void;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentFilters {
  query?: string;
  location?: string;
  school?: string;
  department?: string;
  section?: string;
  attendanceStage?: AttendanceStage;
  page?: number;
  pageSize?: number;
  assignedClassesOnly?: boolean; // Added for filtering by assigned classes
}

export interface DeviceLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  deviceType: 'mobile' | 'desktop';
  userAgent: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface RoleAssignment {
  id: string;
  teacherEmail: string;
  teacherName: string;
  role: Role;
  assignedClasses: string[];
}
