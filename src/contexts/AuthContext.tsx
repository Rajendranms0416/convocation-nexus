
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { logDeviceUsage } from '@/utils/deviceLogger';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, deviceType: 'mobile' | 'desktop') => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

// Mock users for demo
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Robe Manager',
    email: 'robe@example.com',
    role: 'robe-in-charge',
    avatar: 'https://ui-avatars.com/api/?name=Robe+Manager&background=007aff&color=fff',
  },
  {
    id: '2',
    name: 'Folder Manager',
    email: 'folder@example.com',
    role: 'folder-in-charge',
    avatar: 'https://ui-avatars.com/api/?name=Folder+Manager&background=34c759&color=fff',
  },
  {
    id: '3',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'super-admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=ff9500&color=fff',
  },
  {
    id: '4',
    name: 'Presenter',
    email: 'presenter@example.com',
    role: 'presenter',
    avatar: 'https://ui-avatars.com/api/?name=Presenter&background=ff3b30&color=fff',
  },
];

// All users have the password "password" for demo purposes
const MOCK_PASSWORD = 'password';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('convocation_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('convocation_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, deviceType: 'mobile' | 'desktop' = 'desktop') => {
    setIsLoading(true);
    console.log(`Attempting login with email: ${email}, device: ${deviceType}`);
    
    // In a real app, this would be an API call
    // This is just for demo purposes
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email);

        if (foundUser && password === MOCK_PASSWORD) {
          setUser(foundUser);
          localStorage.setItem('convocation_user', JSON.stringify(foundUser));
          
          // Log device usage
          logDeviceUsage(foundUser, deviceType);
          console.log(`Logged in successfully as ${foundUser.name} using ${deviceType} device`);
          
          toast({
            title: 'Login successful',
            description: `Welcome back, ${foundUser.name}!`,
          });
          resolve();
        } else {
          toast({
            title: 'Login failed',
            description: 'Invalid email or password.',
            variant: 'destructive',
          });
          console.error('Login failed: Invalid credentials');
          reject(new Error('Invalid email or password'));
        }
        setIsLoading(false);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('convocation_user');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully.',
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
