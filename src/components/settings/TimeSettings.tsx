
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Role } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface TimeWindow {
  start: string;
  end: string;
}

interface TimeSettingsProps {
  className?: string;
  isMobile?: boolean;
}

const TimeSettings: React.FC<TimeSettingsProps> = ({ className, isMobile = false }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [timeWindows, setTimeWindows] = useState<Record<Role, TimeWindow>>(() => {
    const storedTimeWindows = localStorage.getItem('convocation_time_windows');
    
    if (storedTimeWindows) {
      return JSON.parse(storedTimeWindows);
    }
    
    // Default time windows
    return {
      'robe-in-charge': {
        start: '2023-06-01T08:00',
        end: '2023-06-02T17:00'
      },
      'folder-in-charge': {
        start: '2023-06-03T08:00',
        end: '2023-06-04T17:00'
      },
      'presenter': {
        start: '2023-06-05T08:00',
        end: '2023-06-06T17:00'
      },
      'super-admin': {
        start: '2023-06-01T07:00',
        end: '2023-06-06T19:00'
      }
    };
  });

  // Only super admins can edit time windows
  const canEditTimeWindows = user?.role === 'super-admin';

  const handleTimeChange = (role: Role, field: 'start' | 'end', value: string) => {
    setTimeWindows(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
  };

  const saveTimeSettings = () => {
    // Validate that end times are after start times
    let isValid = true;
    
    Object.entries(timeWindows).forEach(([role, window]) => {
      if (new Date(window.start) >= new Date(window.end)) {
        toast({
          variant: "destructive",
          title: "Invalid time settings",
          description: `End time must be after start time for ${role} role.`
        });
        isValid = false;
      }
    });
    
    if (!isValid) return;
    
    // Save to localStorage
    localStorage.setItem('convocation_time_windows', JSON.stringify(timeWindows));
    
    toast({
      title: "Time settings saved",
      description: "The time windows for all roles have been updated."
    });
    
    setOpen(false);
  };

  const TimeEditor = () => (
    <div className="space-y-6 py-4">
      {(Object.keys(timeWindows) as Role[]).map((role) => (
        <div key={role} className="space-y-2">
          <h3 className="font-medium capitalize">{role.replace(/-/g, ' ')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor={`${role}-start`}>Start Time</Label>
              <Input
                id={`${role}-start`}
                type="datetime-local"
                value={timeWindows[role].start}
                onChange={(e) => handleTimeChange(role, 'start', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`${role}-end`}>End Time</Label>
              <Input
                id={`${role}-end`}
                type="datetime-local"
                value={timeWindows[role].end}
                onChange={(e) => handleTimeChange(role, 'end', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!canEditTimeWindows) return null;

  // Mobile view uses Sheet component, Desktop uses Dialog
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader className="mb-2">
            <SheetTitle>Time Window Settings</SheetTitle>
            <SheetDescription>
              Set the time windows for each role to control when they can perform their tasks.
            </SheetDescription>
          </SheetHeader>
          
          <div className="overflow-y-auto h-[calc(100%-10rem)]">
            <TimeEditor />
          </div>
          
          <SheetFooter className="mt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveTimeSettings}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Settings className="h-4 w-4 mr-2" />
          Time Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Time Window Settings</DialogTitle>
          <DialogDescription>
            Set the time windows for each role to control when they can perform their tasks.
          </DialogDescription>
        </DialogHeader>
        
        <TimeEditor />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveTimeSettings}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSettings;
