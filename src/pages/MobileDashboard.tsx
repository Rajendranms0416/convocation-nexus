
import React, { useEffect, useCallback, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, RotateCcw, Activity } from 'lucide-react';
import MobileStudentTable from '@/components/student/MobileStudentTable';
import { Button } from '@/components/ui/button';
import TimeDisplay from '@/components/settings/TimeDisplay';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

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

// Mock device logs component for mobile view
const MobileDeviceLogs = () => {
  return (
    <div className="space-y-4">
      <div className="bg-convocation-50 p-3 rounded-md border border-convocation-100">
        <h3 className="font-medium text-sm">Device Activity Logs</h3>
        <p className="text-xs text-convocation-400 mt-1">
          Recent user logins and actions
        </p>
      </div>
      
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i}
            className="bg-white p-3 rounded-md border border-convocation-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">User {i}</p>
                <p className="text-xs text-convocation-400">
                  {i % 2 === 0 ? 'Mobile' : 'Desktop'} • {i % 3 === 0 ? 'Presenter' : 'Robe In-charge'}
                </p>
                <p className="text-xs mt-1">
                  {new Date(Date.now() - i * 3600000).toLocaleString()}
                </p>
              </div>
              <div className="bg-convocation-100 p-1 rounded-full">
                <Activity className="h-4 w-4 text-convocation-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileDashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("students");

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
        {user.role === 'super-admin' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students" className="mt-0">
              <MobileStudentTable role={user.role as any} />
            </TabsContent>
            
            <TabsContent value="logs" className="mt-0">
              <MobileDeviceLogs />
            </TabsContent>
          </Tabs>
        ) : (
          <MobileStudentTable role={user.role as any} />
        )}
      </main>
    </div>
  );
};

export default MobileDashboard;
