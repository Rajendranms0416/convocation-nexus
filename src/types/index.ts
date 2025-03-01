
export type Role = 'robe-in-charge' | 'folder-in-charge' | 'super-admin' | 'presenter';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
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
