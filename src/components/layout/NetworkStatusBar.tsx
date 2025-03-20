
import React, { useEffect, useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Clock, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const NetworkStatusBar: React.FC = () => {
  const { lastSyncTime, syncData, isSyncing, needsSync } = useStudents();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const { toast } = useToast();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      checkDatabaseConnection();
      toast({
        title: "You're back online",
        description: "Syncing your data...",
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setIsDbConnected(false);
      toast({
        variant: "destructive",
        title: "You're offline",
        description: "Changes will be saved locally until connection is restored.",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check database connection on mount
    checkDatabaseConnection();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Check database connection
  const checkDatabaseConnection = async () => {
    if (!isOnline) {
      setIsDbConnected(false);
      return;
    }
    
    setIsCheckingDb(true);
    try {
      const { error } = await supabase.from('teachers').select('count');
      
      setIsDbConnected(!error);
      if (error) {
        console.error('Database connection error:', error);
      }
    } catch (error) {
      console.error('Error checking database connection:', error);
      setIsDbConnected(false);
    } finally {
      setIsCheckingDb(false);
    }
  };

  // Trigger sync when reconnecting
  useEffect(() => {
    if (isOnline && needsSync && !isSyncing) {
      syncData();
    }
  }, [isOnline, needsSync, isSyncing, syncData]);

  // Periodically check database connection
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline) {
        checkDatabaseConnection();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-convocation-100 p-3 flex items-center justify-between z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className={cn(
          "flex items-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium", 
          isOnline ? "bg-convocation-success/10 text-convocation-success" : "bg-convocation-error/10 text-convocation-error"
        )}>
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <span>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className={cn(
          "flex items-center gap-2 py-1.5 px-3 rounded-md text-sm font-medium",
          isDbConnected ? "bg-convocation-success/10 text-convocation-success" : "bg-convocation-error/10 text-convocation-error"
        )}>
          <Database className="h-4 w-4" />
          <span>
            {isCheckingDb ? 'Checking...' : (isDbConnected ? 'DB Connected' : 'DB Disconnected')}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {lastSyncTime 
              ? `Last sync: ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}` 
              : 'Never synced'}
          </span>
          
          {needsSync && !isSyncing && (
            <AlertTriangle className="h-4 w-4 text-convocation-error ml-1" />
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={checkDatabaseConnection}
          disabled={isCheckingDb || !isOnline}
          size="sm"
          variant="ghost"
          className="text-sm"
        >
          <Database className="h-4 w-4 mr-1" />
          Check DB
        </Button>
        
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
    </div>
  );
};

export default NetworkStatusBar;
