
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import MobileLoginForm from '@/components/auth/MobileLoginForm';
import AdminLoginForm from '@/components/auth/AdminLoginForm';
import { logDeviceUsage } from '@/utils/deviceLogger';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceParam = searchParams.get('device');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | null>(null);
  const { toast } = useToast();
  const [loginMode, setLoginMode] = useState<'teacher' | 'admin'>('teacher');

  // Debug logs
  console.log('Login rendering, device param:', deviceParam);
  console.log('Auth state:', { isAuthenticated, isLoading, user });

  useEffect(() => {
    // If device is in URL params, use it
    if (deviceParam === 'desktop' || deviceParam === 'mobile') {
      console.log('Setting device from URL params:', deviceParam);
      setDeviceType(deviceParam);
      localStorage.setItem('devicePreference', deviceParam);
    } else {
      // Check localStorage if not in URL
      const storedPreference = localStorage.getItem('devicePreference') as 'desktop' | 'mobile' | null;
      if (storedPreference) {
        console.log('Using stored device preference:', storedPreference);
        setDeviceType(storedPreference);
      } else {
        // If no device preference is set, redirect to device selection
        navigate('/', { replace: true });
      }
    }
  }, [deviceParam, navigate]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && deviceType && user) {
      console.log('Authenticated, redirecting based on login mode:', loginMode);
      
      // If admin login, redirect to role assignment page
      if (user.role === 'super-admin' && loginMode === 'admin') {
        navigate('/role-assignment', { replace: true });
        return;
      }
      
      // For teachers, log device usage and redirect to appropriate dashboard
      logDeviceUsage(user, deviceType)
        .then((logEntry) => {
          console.log('Device usage logged successfully:', logEntry);
          console.log('Now redirecting to:', deviceType === 'mobile' ? '/mobile-dashboard' : '/dashboard');
          
          // Redirect to appropriate dashboard based on device type
          if (deviceType === 'mobile') {
            navigate('/mobile-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        })
        .catch(error => {
          console.error('Error logging device usage:', error);
          toast({
            title: "Warning",
            description: "Unable to log device usage, but continuing to dashboard",
            variant: "destructive",
          });
          
          // Still redirect even if logging fails
          if (deviceType === 'mobile') {
            navigate('/mobile-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        });
    }
  }, [isAuthenticated, isLoading, navigate, deviceType, user, toast, loginMode]);

  // If still loading authentication state, show loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
          <div className="h-4 w-48 rounded bg-convocation-100"></div>
        </div>
      </div>
    );
  }

  // If no device type is set, show loading until redirect happens
  if (!deviceType) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="animate-pulse space-y-4 flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-convocation-100"></div>
          <div className="h-4 w-48 rounded bg-convocation-100"></div>
        </div>
      </div>
    );
  }

  // Desktop view with login mode tabs
  if (deviceType === 'desktop') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
        <Tabs 
          defaultValue="teacher" 
          className="w-full max-w-md"
          onValueChange={(value) => setLoginMode(value as 'teacher' | 'admin')}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="teacher">Convocation App</TabsTrigger>
            <TabsTrigger value="admin">Role Management</TabsTrigger>
          </TabsList>
          <TabsContent value="teacher">
            <LoginForm loginMode="teacher" />
          </TabsContent>
          <TabsContent value="admin">
            <AdminLoginForm />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Mobile view - only show the mobile login form for teachers
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
      <MobileLoginForm />
    </div>
  );
};

export default Login;
