
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import StudentTable from '@/components/student/StudentTable';
import StatsCards from '@/components/dashboard/StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wifi, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useStudents } from '@/contexts/StudentContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { lastSyncTime, syncData, isSyncing, needsSync, isWithinTimeWindow } = useStudents();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const { toast } = useToast();

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Syncing your data...",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        variant: "destructive",
        title: "You're offline",
        description: "Changes will be saved locally until connection is restored.",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  const canEditRecords = isWithinTimeWindow(user.role);

  return (
    <div className="min-h-screen bg-convocation-50 flex flex-col">
      <Header />
      
      {/* Network Status Bar - Top */}
      <div className="bg-background border-b border-convocation-100 p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium", 
            isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}>
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {lastSyncTime 
                ? `Last sync: ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}` 
                : 'Never synced'}
            </span>
          </div>
        </div>
        
        <Button 
          onClick={syncData}
          disabled={isSyncing || !isOnline}
          size="default"
          variant="outline"
          className="text-sm"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Sync Now
        </Button>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
            {!canEditRecords && user.role !== 'super-admin' && (
              <p className="text-sm text-amber-600 mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                You are outside your operating hours. View only mode enabled.
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {user.role === 'super-admin' && <StatsCards />}
          
          <div className="glass-card rounded-lg p-4 border border-convocation-100">
            {user.role === 'super-admin' ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="robes">Robe Attendance</TabsTrigger>
                  <TabsTrigger value="parade">Parade Attendance</TabsTrigger>
                  <TabsTrigger value="folders">Folders</TabsTrigger>
                  <TabsTrigger value="presenter">Presented</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <StudentTable role="super-admin" />
                </TabsContent>
                <TabsContent value="robes" className="mt-4">
                  <StudentTable role="robe-in-charge" />
                </TabsContent>
                <TabsContent value="parade" className="mt-4">
                  <StudentTable role="robe-in-charge" robeTab="slot2" />
                </TabsContent>
                <TabsContent value="folders" className="mt-4">
                  <StudentTable role="folder-in-charge" />
                </TabsContent>
                <TabsContent value="presenter" className="mt-4">
                  <StudentTable role="presenter" />
                </TabsContent>
              </Tabs>
            ) : (
              <StudentTable role={user.role as any} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
