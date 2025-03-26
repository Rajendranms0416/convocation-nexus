
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllSessions } from '@/utils/authHelpers';

export interface DatabaseInfo {
  id: string;
  tableName: string;
  session: string;
  uploadDate: string;
  recordCount: number;
}

interface SessionDataLoaderProps {
  currentSession: string;
  setCurrentSession: (session: string) => void;
  availableSessions: string[];
  setAvailableSessions: (sessions: string[]) => void;
  loadTeacherData: (session: string) => Promise<any>; 
  children: React.ReactNode;
}

const SessionDataLoader: React.FC<SessionDataLoaderProps> = ({
  currentSession,
  setCurrentSession,
  availableSessions,
  setAvailableSessions,
  loadTeacherData,
  children
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = () => {
      console.log('Loading available sessions');
      const sessions = getAllSessions();
      console.log('Sessions loaded:', sessions);
      setAvailableSessions(sessions);
      
      if (sessions.length > 0 && !sessions.includes(currentSession)) {
        console.log('Setting current session to first available:', sessions[0]);
        setCurrentSession(sessions[0]);
      }
    };
    
    loadSessions();
    
    const handleDataUpdate = (event: CustomEvent) => {
      console.log('Teacher data updated event received:', event.detail);
      loadSessions();
      
      if (event.detail?.session) {
        console.log('Setting session from event:', event.detail.session);
        setCurrentSession(event.detail.session);
      }
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    };
  }, [currentSession, setCurrentSession, setAvailableSessions]);

  // Load data when session changes
  useEffect(() => {
    const loadSessionData = async () => {
      console.log('Loading session data for:', currentSession);
      setIsRefreshing(true);
      try {
        const data = await loadTeacherData(currentSession);
        console.log('Session data loaded:', data?.length || 0, 'records');
      } catch (error) {
        console.error("Error loading session data:", error);
        toast({
          title: "Error loading data",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      } finally {
        setIsRefreshing(false);
      }
    };
    
    if (currentSession) {
      loadSessionData();
    }
  }, [currentSession, loadTeacherData, toast]);

  // Pass isRefreshing state to children
  return (
    <>{React.cloneElement(children as React.ReactElement, { isRefreshing })}</>
  );
};

export default SessionDataLoader;
