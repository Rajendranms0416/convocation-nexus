
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Role } from '@/types';
import { format } from 'date-fns';
import TimeSettings from './TimeSettings';

interface TimeDisplayProps {
  className?: string;
  isMobile?: boolean;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({ className, isMobile = false }) => {
  const [timeWindows, setTimeWindows] = useState<Record<Role, { start: string; end: string }>>({} as any);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get time windows from localStorage
    const storedTimeWindows = localStorage.getItem('convocation_time_windows');
    
    if (storedTimeWindows) {
      setTimeWindows(JSON.parse(storedTimeWindows));
    }
    
    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Get user role from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('convocation_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setActiveRole(user.role as Role);
      setIsAdmin(user.role === 'super-admin');
    }
  }, []);

  // Check if the current time is within the time window for a role
  const isWithinTimeWindow = (role: Role): boolean => {
    if (!timeWindows[role]) return false;
    
    const now = currentTime;
    const windowStart = new Date(timeWindows[role].start);
    const windowEnd = new Date(timeWindows[role].end);
    
    return now >= windowStart && now <= windowEnd;
  };

  // Format time window for display
  const formatTimeWindow = (role: Role): string => {
    if (!timeWindows[role]) return 'Not set';
    
    const start = new Date(timeWindows[role].start);
    const end = new Date(timeWindows[role].end);
    
    return `${format(start, 'PPP p')} - ${format(end, 'PPP p')}`;
  };

  // Get remaining time for active role
  const getRemainingTime = (): string => {
    if (!activeRole || !timeWindows[activeRole]) return '';
    
    const now = currentTime;
    const windowEnd = new Date(timeWindows[activeRole].end);
    
    if (now > windowEnd) {
      return 'Time window has ended';
    }
    
    const windowStart = new Date(timeWindows[activeRole].start);
    if (now < windowStart) {
      return 'Time window has not started yet';
    }
    
    // Calculate remaining time
    const diff = windowEnd.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  // Get status for display
  const getStatusBadge = (role: Role) => {
    if (!timeWindows[role]) return <Badge variant="outline">Not configured</Badge>;
    
    const now = currentTime;
    const windowStart = new Date(timeWindows[role].start);
    const windowEnd = new Date(timeWindows[role].end);
    
    if (now < windowStart) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Upcoming</Badge>;
    } else if (now > windowEnd) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
    }
  };

  // If no time windows are set or no active role, don't show anything
  if (Object.keys(timeWindows).length === 0 || !activeRole) return null;

  return (
    <div className="flex items-center gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" size="sm" className={`${className} gap-2`}>
            <Timer className="h-4 w-4" />
            <span className="hidden md:inline">Time Window</span>
            {activeRole && isWithinTimeWindow(activeRole) && (
              <Badge variant="outline" className="ml-2 h-5 px-1 bg-green-100 text-green-800 border-green-200">
                {getRemainingTime()}
              </Badge>
            )}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4">
          <h3 className="font-medium text-lg mb-2">Your Time Window</h3>
          <div className="space-y-3">
            {activeRole && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">{activeRole.replace(/-/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeWindow(activeRole)}</p>
                </div>
                {getStatusBadge(activeRole)}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t">
            {isWithinTimeWindow(activeRole) ? (
              <p className="text-sm text-green-600 font-medium">
                You can currently edit student records
              </p>
            ) : (
              <p className="text-sm text-convocation-error font-medium">
                You can only view records at this time
              </p>
            )}
          </div>
          
          {/* Show all time windows for admin */}
          {isAdmin && Object.keys(timeWindows).length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h4 className="font-medium mb-2">All Time Windows (Admin View)</h4>
              <div className="space-y-2">
                {(Object.keys(timeWindows) as Role[]).map((role) => (
                  <div key={role} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium capitalize">{role.replace(/-/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeWindow(role)}</p>
                    </div>
                    {getStatusBadge(role)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </HoverCardContent>
      </HoverCard>
      
      {isAdmin && <TimeSettings isMobile={isMobile} className={isMobile ? "" : "ml-2"} />}
    </div>
  );
};

export default TimeDisplay;
