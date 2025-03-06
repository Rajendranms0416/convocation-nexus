
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import MobileLoginForm from '@/components/auth/MobileLoginForm';
import DeviceSelectionPrompt from '@/components/common/DeviceSelectionPrompt';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const deviceParam = searchParams.get('device');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile' | null>(
    (deviceParam as 'desktop' | 'mobile') || null
  );

  useEffect(() => {
    // Check localStorage if deviceParam is not provided
    if (!deviceType) {
      const storedPreference = localStorage.getItem('devicePreference') as 'desktop' | 'mobile';
      if (storedPreference) {
        setDeviceType(storedPreference);
      }
    } else {
      // Ensure the preference is saved in localStorage when coming from URL params
      localStorage.setItem('devicePreference', deviceType);
    }
  }, [deviceType]);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect to appropriate dashboard based on device type
      if (deviceType === 'mobile') {
        navigate('/mobile-dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, navigate, deviceType]);

  // Add debugging log
  console.log('Current device type:', deviceType);

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-convocation-50 px-4">
      {!deviceType && <DeviceSelectionPrompt />}
      {deviceType === 'desktop' && <LoginForm />}
      {deviceType === 'mobile' && <MobileLoginForm />}
    </div>
  );
};

export default Login;
