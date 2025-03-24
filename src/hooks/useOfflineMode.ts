
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseOfflineModeProps {
  enabled?: boolean;
}

export const useOfflineMode = ({ enabled = false }: UseOfflineModeProps = {}) => {
  const [isOffline, setIsOffline] = useState(false);
  const [preferOffline, setPreferOffline] = useState(enabled);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user has previously chosen offline mode
    const preferredMode = localStorage.getItem('preferOfflineMode');
    if (preferredMode === 'true') {
      setPreferOffline(true);
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (!preferOffline) {
        toast({
          title: "You're back online",
          description: preferOffline 
            ? "Still using offline mode as you preferred" 
            : "Connection restored",
        });
      }
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      toast({
        variant: "destructive",
        title: "You're offline",
        description: "Changes will be saved locally until connection is restored.",
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Initial check
    setIsOffline(!navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [preferOffline, toast]);

  const toggleOfflineMode = () => {
    const newValue = !preferOffline;
    setPreferOffline(newValue);
    localStorage.setItem('preferOfflineMode', String(newValue));
    
    toast({
      title: newValue ? "Offline mode enabled" : "Online mode enabled",
      description: newValue 
        ? "All data will be stored locally only" 
        : "Data will be synced with the database when possible",
    });
  };

  return {
    isOffline,
    preferOffline,
    toggleOfflineMode,
    // Either the user prefers offline mode or the network is actually offline
    useOfflineStorage: preferOffline || isOffline
  };
};
