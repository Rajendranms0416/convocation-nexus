
import React from 'react';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WifiOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OfflineModeToggleProps {
  className?: string;
}

const OfflineModeToggle: React.FC<OfflineModeToggleProps> = ({ className }) => {
  const { preferOffline, toggleOfflineMode } = useOfflineMode();

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2">
              <Switch 
                id="offline-mode" 
                checked={preferOffline}
                onCheckedChange={toggleOfflineMode}
              />
              <Label htmlFor="offline-mode" className="flex items-center gap-1 cursor-pointer">
                <WifiOff className="h-4 w-4" />
                <span>Offline Mode</span>
              </Label>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>When enabled, data will only be stored locally</p>
            <p>and won't attempt to connect to the database</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default OfflineModeToggle;
