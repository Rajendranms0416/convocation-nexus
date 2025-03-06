
import React, { useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, RotateCcw } from 'lucide-react';
import MobileStudentTable from '@/components/student/MobileStudentTable';
import { Button } from '@/components/ui/button';
import TimeDisplay from '@/components/settings/TimeDisplay';

// Memoized header component to prevent unnecessary re-renders
const DashboardHeader = memo(({ user, onLogout, onSwitchView }: {
  user: any;
  onLogout: () => void;
  onSwitchView: () => void;
}) => (
  <header className="bg-white border-b border-convocation-100 shadow-sm sticky top-0 z-10">
    <div className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-2">
            <img 
              src="/convocation-logo.svg" 
              alt="Logo" 
              className="h-6 w-auto"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-convocation-700">Convocation</h1>
            <div className="flex items-center">
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-convocation-100 text-convocation-600">
                {user.role.replace(/-/g, ' ')}
              </span>
              <TimeDisplay className="ml-2 text-xs" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onSwitchView}
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onLogout}
            className="h-8 w-8 text-convocation-error"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </header>
));

DashboardHeader.displayName = 'DashboardHeader';

const MobileDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleSwitchView = useCallback(() => {
    localStorage.removeItem('devicePreference');
    window.location.href = '/';
  }, []);

  if (isLoading || !user) {
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
    <div className="min-h-screen bg-convocation-50 flex flex-col">
      <DashboardHeader 
        user={user} 
        onLogout={handleLogout} 
        onSwitchView={handleSwitchView} 
      />
      
      <main className="flex-1 container mx-auto px-3 py-3">
        <MobileStudentTable role={user.role as any} />
      </main>
    </div>
  );
};

export default MobileDashboard;
