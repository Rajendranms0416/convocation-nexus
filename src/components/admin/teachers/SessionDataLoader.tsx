
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
  currentDatabase: DatabaseInfo | null;
  setCurrentDatabase: (database: DatabaseInfo | null) => void;
  loadTeacherData: (session: string) => Promise<any>; // Updated type to accept any Promise return
  children: React.ReactNode;
}

const SessionDataLoader: React.FC<SessionDataLoaderProps> = ({
  currentSession,
  setCurrentSession,
  availableSessions,
  setAvailableSessions,
  currentDatabase,
  setCurrentDatabase,
  loadTeacherData,
  children
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = () => {
      const sessions = getAllSessions();
      setAvailableSessions(sessions);
      
      if (sessions.length > 0 && !sessions.includes(currentSession)) {
        setCurrentSession(sessions[0]);
      }
    };
    
    loadSessions();
    
    const handleDataUpdate = (event: CustomEvent) => {
      loadSessions();
      
      if (event.detail?.session) {
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
      setIsRefreshing(true);
      try {
        await loadTeacherData(currentSession);
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
    
    loadSessionData();
  }, [currentSession, currentDatabase, loadTeacherData, toast]);

  // Pass isRefreshing state to children
  return (
    <>{React.cloneElement(children as React.ReactElement, { isRefreshing })}</>
  );
};

export default SessionDataLoader;
