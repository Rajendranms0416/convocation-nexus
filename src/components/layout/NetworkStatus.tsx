
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [needsSync, setNeedsSync] = useState(false);
  const { toast } = useToast();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (needsSync) {
        syncData();
      }
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
  }, [needsSync, toast]);
  
  // Simulate data sync - in a real app, this would connect to your backend
  const syncData = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastSyncTime', now.toISOString());
      setNeedsSync(false);
      
      toast({
        title: "Sync completed",
        description: "All data is up to date.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Please try again later.",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Initialize last sync time from localStorage
  useEffect(() => {
    const storedSyncTime = localStorage.getItem('lastSyncTime');
    if (storedSyncTime) {
      setLastSyncTime(new Date(storedSyncTime));
    }
  }, []);
  
  // Trigger manual sync
  const handleManualSync = () => {
    if (isOnline && !isSyncing) {
      syncData();
    } else if (!isOnline) {
      toast({
        variant: "destructive",
        title: "Cannot sync",
        description: "You are currently offline. Please connect to the internet and try again.",
      });
    }
  };
  
  // Set needsSync when localStorage changes (indicating offline changes)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!needsSync) {
        setNeedsSync(true);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [needsSync]);

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <button 
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline}
        className="flex items-center gap-1 py-1 px-2 rounded-md bg-background hover:bg-muted transition-colors disabled:opacity-50"
        title="Sync data"
      >
        {isSyncing ? (
          <RefreshCw className="h-4 w-4 animate-spin text-convocation-400" />
        ) : (
          <RefreshCw className="h-4 w-4 text-convocation-400" />
        )}
        
        <span className="text-xs">
          {lastSyncTime 
            ? `Last sync: ${formatDistanceToNow(lastSyncTime, { addSuffix: true })}` 
            : 'Never synced'}
        </span>
        
        {needsSync && !isSyncing && (
          <AlertTriangle className="h-4 w-4 text-convocation-error ml-1" />
        )}
      </button>
      
      <div className={cn(
        "flex items-center gap-1 py-1 px-2 rounded-md", 
        isOnline ? "bg-convocation-success/10 text-convocation-success" : "bg-convocation-error/10 text-convocation-error"
      )}>
        {isOnline ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="text-xs font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

export default NetworkStatus;
