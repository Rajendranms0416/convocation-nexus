
import { useState } from 'react';
import { useToast } from './use-toast';
import { Role } from '@/types';

// Mock data structure for users
interface UserCredentials {
  id: string;
  email: string;
  name: string;
  password: string;
  role: Role;
}

// Mock user database
const MOCK_USERS: UserCredentials[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    password: 'password123',
    role: 'super-admin'
  },
  {
    id: '2',
    email: 'robe@example.com',
    name: 'Robe Teacher',
    password: 'password123',
    role: 'robe-in-charge'
  },
  {
    id: '3',
    email: 'folder@example.com',
    name: 'Folder Teacher',
    password: 'password123',
    role: 'folder-in-charge'
  },
  {
    id: '4',
    email: 'presenter@example.com',
    name: 'Presenter',
    password: 'password123',
    role: 'presenter'
  }
];

// Simple encoding function for the token
const createToken = (user: UserCredentials): string => {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log("Login attempt with email:", email);
      
      // Simple delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Find the user in our mock database
      const user = MOCK_USERS.find(u => u.email === email);

      if (!user || user.password !== password) {
        console.error("Invalid credentials. User not found or password doesn't match");
        toast({
          title: 'Login Failed',
          description: 'Invalid email or password',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log('Found user with role:', user.role);

      // Create a JWT-like token
      const token = createToken(user);

      // Store the token and user data
      localStorage.setItem('convocation_token', token);
      localStorage.setItem('convocation_user', JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }));

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${user.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('convocation_token');
    localStorage.removeItem('convocation_user');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  return {
    login,
    logout,
    isLoading
  };
};
