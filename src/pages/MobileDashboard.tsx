
import React, { useEffect, useCallback, memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, RotateCcw, Activity, Clock } from 'lucide-react';
import MobileStudentTable from '@/components/student/MobileStudentTable';
import { Button } from '@/components/ui/button';
import TimeDisplay from '@/components/settings/TimeDisplay';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

// Memoized header component to prevent unnecessary re-renders
const DashboardHeader = memo(({ user, onLogout, onSwitchView }: {
  user: any;
  onLogout: () => void;
  onSwitchView: () => void;
}) => {
  const [timeWindows, setTimeWindows] = useState<Record<string, { start: string; end: string }>>({});
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Get time windows from localStorage
    const storedTimeWindows = localStorage.getItem('convocation_time_windows');
    
    if (storedTimeWindows) {
      setTimeWindows(JSON.parse(storedTimeWindows));
    }
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Check if the current time is within the time window for a role
  const isWithinTimeWindow = (role: string): boolean => {
    if (!timeWindows[role]) return false;
    
    const now = currentTime;
    const windowStart = new Date(timeWindows[role].start);
    const windowEnd = new Date(timeWindows[role].end);
    
    return now >= windowStart && now <= windowEnd;
  };

  return (
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
              <div className="flex items-center flex-wrap">
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-convocation-100 text-convocation-600">
                  {user.role.replace(/-/g, ' ')}
                </span>
                <TimeDisplay className="ml-2 text-xs" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                >
                  <Clock className="h-4 w-4 text-convocation-500" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-3">
                <h3 className="font-medium text-sm mb-2">Time Windows</h3>
                <div className="space-y-2">
                  {Object.entries(timeWindows).map(([role, window]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium capitalize">{role.replace(/-/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(window.start).toLocaleDateString()} - {new Date(window.end).toLocaleDateString()}
                        </p>
                      </div>
                      {isWithinTimeWindow(role) ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 text-xs">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-500 text-xs">Inactive</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {user && (
                  <div className="mt-3 pt-2 border-t border-convocation-100">
                    <p className="text-xs">
                      {isWithinTimeWindow(user.role) ? (
                        <span className="text-green-600">You can edit records now</span>
                      ) : (
                        <span className="text-convocation-error">View only mode active</span>
                      )}
                    </p>
                  </div>
                )}
              </HoverCardContent>
            </HoverCard>

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
  );
});

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

  useEffect(() => {
    // Initialize time windows if they don't exist in localStorage
    const storedTimeWindows = localStorage.getItem('convocation_time_windows');
    
    if (!storedTimeWindows) {
      // Set default time windows for the demo
      const defaultTimeWindows = {
        'robe-in-charge': {
          start: '2023-06-01T08:00',
          end: '2023-06-02T17:00'
        },
        'folder-in-charge': {
          start: '2023-06-03T08:00',
          end: '2023-06-04T17:00'
        },
        'presenter': {
          start: '2023-06-05T08:00',
          end: '2023-06-06T17:00'
        },
        'super-admin': {
          start: '2023-06-01T07:00',
          end: '2023-06-06T19:00'
        }
      };
      
      localStorage.setItem('convocation_time_windows', JSON.stringify(defaultTimeWindows));
    }
  }, []);

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
