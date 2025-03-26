
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
  avatar?: string;
  assignedClasses?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
}

// Default super admin email
export const SUPER_ADMIN_EMAIL = 'admin@example.com';
