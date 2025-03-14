
import React from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const NetworkStatusBar: React.FC = () => {
  const { lastSyncTime, syncData, isSyncing, needsSync } = useStudents();
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

  // Trigger sync when reconnecting
  React.useEffect(() => {
    if (isOnline && needsSync && !isSyncing) {
      syncData();
    }
  }, [isOnline, needsSync, isSyncing, syncData]);

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
  );
};

export default NetworkStatusBar;
