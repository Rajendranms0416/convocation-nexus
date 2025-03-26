
import { useState, useEffect, useCallback } from 'react';
import { getTeachersBySession } from '@/utils/authHelpers';
import { Role } from '@/types';
import { supabase, queryDynamicTable } from '@/integrations/supabase/client';
import { DynamicTableRow } from '@/integrations/supabase/custom-types';

interface DatabaseInfo {
  id: string;
  tableName: string;
  session: string;
  uploadDate: string;
  recordCount: number;
}

/**
 * Hook to load and format teacher data based on selected session and database
 */
export const useTeacherDataLoader = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSession, setCurrentSession] = useState<string>("April 22, 2023 - Morning (09:00 AM)");
  const [currentDatabase, setCurrentDatabase] = useState<DatabaseInfo | null>(null);

  const loadTeacherData = useCallback(async (
    session: string = currentSession,
    database: DatabaseInfo | null = currentDatabase
  ) => {
    setIsLoading(true);
    setCurrentSession(session);
    
    try {
      // If we have a specific database to load from
      if (database) {
        setCurrentDatabase(database);
        
        // Load from Supabase using the specific table name
        const { data: tableData, error } = await queryDynamicTable(database.tableName)
          .select('*');
        
        if (error) {
          console.error('Error loading from database:', error);
          throw error;
        }
        
        if (!tableData) {
          setTeachers([]);
          return;
        }
        
        // Transform to the format needed for the table
        const formattedTeachers = (tableData as unknown as DynamicTableRow[]).map((teacher, index) => {
          const formattedTeacher: any[] = [];
          
          // Process teacher with Robe Email ID
          if (teacher.Robe_Email_ID && teacher.Robe_Email_ID.includes('@')) {
            formattedTeacher.push({
              id: `robe-${index + 1}`,
              name: teacher.Accompanying_Teacher || 'Unknown',
              email: teacher.Robe_Email_ID,
              role: 'robe-in-charge' as Role,
              program: teacher.Programme_Name || '',
              section: teacher.Class_Section || '',
              assignedClasses: [teacher.Programme_Name || ''].filter(Boolean),
              session: session,
              dbTable: database.tableName,
              rawData: teacher,
              dbId: teacher.id
            });
          }
          
          // Process teacher with Folder Email ID (as a separate teacher entry)
          if (teacher.Folder_Email_ID && teacher.Folder_Email_ID.includes('@')) {
            formattedTeacher.push({
              id: `folder-${index + 1}`,
              name: teacher.Folder_in_Charge || 'Unknown',
              email: teacher.Folder_Email_ID,
              role: 'folder-in-charge' as Role,
              program: teacher.Programme_Name || '',
              section: teacher.Class_Section || '',
              assignedClasses: [teacher.Programme_Name || ''].filter(Boolean),
              session: session,
              dbTable: database.tableName,
              rawData: teacher,
              dbId: teacher.id
            });
          }
          
          return formattedTeacher;
        }).flat();
        
        console.log(`Loaded and formatted teachers from database ${database.tableName}:`, formattedTeachers);
        setTeachers(formattedTeachers);
      } else {
        // Fallback to localStorage for the specific session
        const loadedTeachers = getTeachersBySession(session);
        
        // Array to hold our formatted teachers
        const formattedTeachers: any[] = [];
        
        // Transform to the format needed for the table
        loadedTeachers.forEach((teacher, index) => {
          // Process teacher with Robe Email ID
          if (teacher['Robe Email ID'] && teacher['Robe Email ID'].includes('@')) {
            formattedTeachers.push({
              id: `robe-${index + 1}`,
              name: teacher['Accompanying Teacher'] || 'Unknown',
              email: teacher['Robe Email ID'],
              role: 'robe-in-charge' as Role,
              program: teacher['Programme Name'] || '',
              section: teacher['Class Wise/\nSection Wise'] || '',
              assignedClasses: [teacher['Programme Name'] || ''].filter(Boolean),
              session: session,
              rawData: teacher
            });
          }
          
          // Process teacher with Folder Email ID (as a separate teacher entry)
          if (teacher['Folder Email ID'] && teacher['Folder Email ID'].includes('@')) {
            formattedTeachers.push({
              id: `folder-${index + 1}`,
              name: teacher['Folder in Charge'] || 'Unknown',
              email: teacher['Folder Email ID'],
              role: 'folder-in-charge' as Role,
              program: teacher['Programme Name'] || '',
              section: teacher['Class Wise/\nSection Wise'] || '',
              assignedClasses: [teacher['Programme Name'] || ''].filter(Boolean),
              session: session,
              rawData: teacher
            });
          }
        });
        
        console.log(`Loaded and formatted teachers for session ${session}:`, formattedTeachers);
        setTeachers(formattedTeachers);
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSession, currentDatabase]);

  // Set up initial data loading and update listener
  useEffect(() => {
    loadTeacherData(currentSession, currentDatabase);
    
    // Listen for data updates from other components
    const handleDataUpdate = (event: CustomEvent) => {
      // If the event includes a session, load data for that session
      const eventSession = event.detail?.session;
      const tableId = event.detail?.tableId;
      
      if (tableId) {
        // Load the database info for this table
        const getDbInfo = async () => {
          try {
            const { data, error } = await supabase
              .from('file_uploads')
              .select('id, table_name, session_info, upload_date, record_count')
              .eq('id', tableId)
              .single();
              
            if (error) throw error;
            
            if (data) {
              const dbInfo: DatabaseInfo = {
                id: String(data.id),
                tableName: data.table_name,
                session: data.session_info || 'Unknown Session',
                uploadDate: new Date(data.upload_date).toLocaleString(),
                recordCount: data.record_count || 0
              };
              
              loadTeacherData(dbInfo.session, dbInfo);
            }
          } catch (error) {
            console.error('Error getting database info:', error);
            if (eventSession) {
              loadTeacherData(eventSession, null);
            } else {
              loadTeacherData(currentSession, null);
            }
          }
        };
        
        getDbInfo();
      } else if (eventSession) {
        loadTeacherData(eventSession, null);
      } else {
        loadTeacherData(currentSession, currentDatabase);
      }
    };
    
    window.addEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDataUpdate as EventListener);
    };
  }, [loadTeacherData, currentSession, currentDatabase]);

  return {
    teachers,
    setTeachers,
    isLoading,
    currentSession,
    setCurrentSession,
    currentDatabase,
    setCurrentDatabase,
    loadTeacherData,
  };
};
