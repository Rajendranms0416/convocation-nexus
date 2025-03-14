
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format, parse, set } from 'date-fns';

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

  // Custom time controls for more granular time selection
  const [customTimeControls, setCustomTimeControls] = useState<Record<Role, {
    startDate: string;
    startHour: string;
    startMinute: string;
    endDate: string;
    endHour: string;
    endMinute: string;
  }>>(() => {
    const result: Record<string, any> = {};
    
    Object.entries(timeWindows).forEach(([role, window]) => {
      const startDate = new Date(window.start);
      const endDate = new Date(window.end);
      
      result[role] = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        startHour: format(startDate, 'HH'),
        startMinute: format(startDate, 'mm'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        endHour: format(endDate, 'HH'),
        endMinute: format(endDate, 'mm'),
      };
    });
    
    return result;
  });

  // Generate options for hours and minutes
  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleCustomTimeChange = (role: Role, field: string, value: string) => {
    setCustomTimeControls(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value
      }
    }));
    
    // Update the actual timeWindows based on the custom controls
    const controls = {
      ...customTimeControls[role],
      [field]: value
    };
    
    const newStartDate = new Date(`${controls.startDate}T${controls.startHour}:${controls.startMinute}`);
    const newEndDate = new Date(`${controls.endDate}T${controls.endHour}:${controls.endMinute}`);
    
    setTimeWindows(prev => ({
      ...prev,
      [role]: {
        start: newStartDate.toISOString().substring(0, 16),
        end: newEndDate.toISOString().substring(0, 16)
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
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4 py-2">
        {(Object.keys(timeWindows) as Role[]).map((role) => (
          <div key={role} className="space-y-2 pb-4 border-b border-convocation-100 last:border-b-0">
            <h3 className="font-medium capitalize">{role.replace(/-/g, ' ')}</h3>
            
            {/* Start Time Controls */}
            <div className="space-y-1">
              <Label className="text-sm">Start Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${role}-start-date`} className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    id={`${role}-start-date`}
                    type="date"
                    value={customTimeControls[role].startDate}
                    onChange={(e) => handleCustomTimeChange(role, 'startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`${role}-start-hour`} className="text-xs text-muted-foreground">Hour</Label>
                    <Select 
                      value={customTimeControls[role].startHour}
                      onValueChange={(value) => handleCustomTimeChange(role, 'startHour', value)}
                    >
                      <SelectTrigger id={`${role}-start-hour`} className="mt-1">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map(hour => (
                          <SelectItem key={`start-hour-${hour}`} value={hour}>{hour}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`${role}-start-minute`} className="text-xs text-muted-foreground">Minute</Label>
                    <Select 
                      value={customTimeControls[role].startMinute}
                      onValueChange={(value) => handleCustomTimeChange(role, 'startMinute', value)}
                    >
                      <SelectTrigger id={`${role}-start-minute`} className="mt-1">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map(minute => (
                          <SelectItem key={`start-minute-${minute}`} value={minute}>{minute}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* End Time Controls */}
            <div className="space-y-1">
              <Label className="text-sm">End Time</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`${role}-end-date`} className="text-xs text-muted-foreground">Date</Label>
                  <Input
                    id={`${role}-end-date`}
                    type="date"
                    value={customTimeControls[role].endDate}
                    onChange={(e) => handleCustomTimeChange(role, 'endDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`${role}-end-hour`} className="text-xs text-muted-foreground">Hour</Label>
                    <Select 
                      value={customTimeControls[role].endHour}
                      onValueChange={(value) => handleCustomTimeChange(role, 'endHour', value)}
                    >
                      <SelectTrigger id={`${role}-end-hour`} className="mt-1">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map(hour => (
                          <SelectItem key={`end-hour-${hour}`} value={hour}>{hour}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`${role}-end-minute`} className="text-xs text-muted-foreground">Minute</Label>
                    <Select 
                      value={customTimeControls[role].endMinute}
                      onValueChange={(value) => handleCustomTimeChange(role, 'endMinute', value)}
                    >
                      <SelectTrigger id={`${role}-end-minute`} className="mt-1">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map(minute => (
                          <SelectItem key={`end-minute-${minute}`} value={minute}>{minute}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
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
      <DialogContent className="sm:max-w-[450px] mx-auto">
        <DialogHeader className="text-center">
          <DialogTitle>Time Window Settings</DialogTitle>
          <DialogDescription>
            Set the time windows for each role.
          </DialogDescription>
        </DialogHeader>
        
        <TimeEditor />
        
        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={saveTimeSettings}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSettings;
