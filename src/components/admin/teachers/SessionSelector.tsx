
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarClock } from 'lucide-react';

interface SessionSelectorProps {
  sessions: string[];
  currentSession: string;
  onSessionChange: (session: string) => void;
}

const SessionSelector: React.FC<SessionSelectorProps> = ({
  sessions,
  currentSession,
  onSessionChange
}) => {
  // Default session if none are available
  const availableSessions = sessions.length > 0 
    ? sessions 
    : ["April 22, 2023 - Morning (09:00 AM)"];

  return (
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
  );
};

export default SessionSelector;
