
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
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-convocation-100 p-2 flex items-center justify-between z-50 shadow-md">
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center gap-1 py-1 px-2 rounded-md text-xs", 
          isOnline ? "bg-convocation-success/10 text-convocation-success" : "bg-convocation-error/10 text-convocation-error"
        )}>
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          <span className="font-medium">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            {lastSyncTime 
              ? `Last sync: ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}` 
              : 'Never synced'}
          </span>
          
          {needsSync && !isSyncing && (
            <AlertTriangle className="h-3 w-3 text-convocation-error ml-1" />
          )}
        </div>
      </div>
      
      <Button 
        onClick={syncData}
        disabled={isSyncing || !isOnline}
        size="sm"
        variant="outline"
        className="text-xs h-8"
      >
        {isSyncing ? (
          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <RefreshCw className="h-3 w-3 mr-1" />
        )}
        Sync Now
      </Button>
    </div>
  );
};

export default NetworkStatusBar;
