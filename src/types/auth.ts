
import { User, Role } from '@/types';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, deviceType: 'mobile' | 'desktop') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const SUPER_ADMIN_EMAIL = 'admin@convocation.edu';
export const SUPER_ADMIN_PASSWORD = 'admin123';
