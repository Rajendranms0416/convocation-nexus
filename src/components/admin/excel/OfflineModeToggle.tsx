
import React from 'react';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { Label } from '@/components/ui/label';
import { Laptop } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OfflineModeToggleProps {
  className?: string;
}

const OfflineModeToggle: React.FC<OfflineModeToggleProps> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Laptop className="h-4 w-4" />
              <span>Local Storage Mode</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Data is stored locally in your browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default OfflineModeToggle;
