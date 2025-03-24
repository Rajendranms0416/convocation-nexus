
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionSelectorProps {
  sessions: string[];
  currentSession: string;
  onSessionChange: (session: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  currentSession,
  onSessionChange,
  onRefresh,
  isRefreshing = false
}) => {
  // Default session if none are available
  const availableSessions = sessions.length > 0 
    ? sessions 
    : ["April 22, 2023 - Morning (09:00 AM)"];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Label htmlFor="session-select" className="flex items-center text-muted-foreground">
          <CalendarClock className="h-4 w-4 mr-1" />
          Convocation Session
        </Label>
        <Select 
          value={currentSession} 
          onValueChange={onSessionChange}
        >
          <SelectTrigger id="session-select" className="w-full md:w-72">
            <SelectValue placeholder="Select session" />
          </SelectTrigger>
          <SelectContent>
            {availableSessions.map((session) => (
              <SelectItem key={session} value={session}>
                {session}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {onRefresh && (
        <Button 
          variant="outline" 
          onClick={onRefresh} 
          className="flex items-center h-10 mt-auto"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      )}
    </div>
  );
};

export default SessionSelector;
