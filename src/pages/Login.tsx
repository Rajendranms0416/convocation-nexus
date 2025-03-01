
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

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
      <LoginForm />
    </div>
  );
};

export default Login;
