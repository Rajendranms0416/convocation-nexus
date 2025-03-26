
export enum Role {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  SUPER_ADMIN = 'super-admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string; // Adding avatar property
  assignedClasses?: string[]; // Adding assignedClasses property
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
}
