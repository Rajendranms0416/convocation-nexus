
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DatabaseInfo {
  id: string;
  tableName: string;
  session: string;
  uploadDate: string;
  recordCount: number;
}

interface DatabaseSelectorProps {
  onDatabaseChange: (databaseInfo: DatabaseInfo) => void;
  currentDatabaseId?: string;
}

const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  onDatabaseChange,
  currentDatabaseId
}) => {
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(currentDatabaseId || '');
  const { toast } = useToast();

  const loadDatabases = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .select('id, table_name, session_info, upload_date, record_count')
        .order('upload_date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const formattedData = data.map(item => ({
          id: String(item.id),
          tableName: item.table_name,
          session: item.session_info || 'Unknown Session',
          uploadDate: new Date(item.upload_date).toLocaleString(),
          recordCount: item.record_count || 0
        }));
        
        setDatabases(formattedData);
        
        // If there's data and no selection, select the first one
        if (formattedData.length > 0 && !selectedId) {
          setSelectedId(formattedData[0].id);
          onDatabaseChange(formattedData[0]);
        } else if (selectedId) {
          // Find the currently selected database to update its data
          const selected = formattedData.find(db => db.id === selectedId);
          if (selected) {
            onDatabaseChange(selected);
          }
        }
      }
    } catch (error) {
      console.error('Error loading databases:', error);
      toast({
        title: 'Error loading databases',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDatabases();
    
    // Listen for updates to the databases
    const handleDatabaseUpdate = (event: CustomEvent) => {
      loadDatabases();
      
      // If the event includes a table ID, select that database
      if (event.detail?.tableId) {
        setSelectedId(event.detail.tableId);
      }
    };
    
    window.addEventListener('teacherDataUpdated', handleDatabaseUpdate as EventListener);
    
    return () => {
      window.removeEventListener('teacherDataUpdated', handleDatabaseUpdate as EventListener);
    };
  }, []);

  const handleSelectionChange = (id: string) => {
    setSelectedId(id);
    const selected = databases.find(db => db.id === id);
    if (selected) {
      onDatabaseChange(selected);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Label htmlFor="database-select" className="flex items-center text-muted-foreground">
            <Database className="h-4 w-4 mr-1" />
            Select Database
          </Label>
          <Select 
            value={selectedId} 
            onValueChange={handleSelectionChange}
            disabled={databases.length === 0 || isLoading}
          >
            <SelectTrigger id="database-select" className="w-full md:w-96">
              <SelectValue placeholder={isLoading ? "Loading databases..." : "Select a database"} />
            </SelectTrigger>
            <SelectContent>
              {databases.map((db) => (
                <SelectItem key={db.id} value={db.id} className="flex flex-col">
                  <div className="flex flex-col">
                    <span>{db.session}</span>
                    <span className="text-xs text-muted-foreground">
                      Uploaded: {db.uploadDate} ({db.recordCount} records)
                    </span>
                  </div>
                </SelectItem>
              ))}
              {databases.length === 0 && (
                <SelectItem value="none" disabled>
                  No databases available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          variant="outline" 
          onClick={loadDatabases} 
          className="flex items-center h-10 mt-auto"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      
      {selectedId && (
        <div className="text-sm text-muted-foreground mt-1">
          Currently viewing database: <span className="font-medium">{databases.find(db => db.id === selectedId)?.session}</span>
        </div>
      )}
    </div>
  );
};

export default DatabaseSelector;
