import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import MobileLoginForm from '@/components/auth/MobileLoginForm';
import { logDeviceUsage } from '@/utils/deviceLogger';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceParam = searchParams.get('device');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | null>(null);

  // Debug logs
  console.log('Login rendering, device param:', deviceParam);

  useEffect(() => {
    // If device is in URL params, use it
    if (deviceParam === 'desktop' || deviceParam === 'mobile') {
      console.log('Setting device from URL params:', deviceParam);
      setDeviceType(deviceParam);
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
      console.log('Authenticated, redirecting to dashboard for device type:', deviceType);
      
      // Log device usage
      logDeviceUsage(user, deviceType);
      
      // Redirect to appropriate dashboard based on device type
      if (deviceType === 'mobile') {
        navigate('/mobile-dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, deviceType, user]);

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

  // Otherwise, show the appropriate login form based on device type
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
      {deviceType === 'desktop' && <LoginForm />}
      {deviceType === 'mobile' && <MobileLoginForm />}
    </div>
  );
};

export default Login;
