
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDatabaseConnection = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Try a simple query to check if we can connect to the database
      const { data, error } = await supabase
        .from('teachers')
        .select('id')
        .limit(1);
      
      const connected = !error;
      setIsConnected(connected);
      setLastChecked(new Date());
      
      return connected;
    } catch (err) {
      console.error('Database connection check failed:', err);
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  return {
    isConnected,
    isChecking,
    lastChecked,
    checkConnection
  };
};
