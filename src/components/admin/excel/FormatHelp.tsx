
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FormatHelpProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  requiredColumns: string[];
}

const FormatHelp: React.FC<FormatHelpProps> = ({ 
  showHelp, 
  setShowHelp, 
  requiredColumns 
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground p-0 h-auto" 
          onClick={() => setShowHelp(!showHelp)}
        >
          <Info className="h-3 w-3 mr-1" /> 
          {showHelp ? 'Hide format help' : 'Show format help'}
        </Button>
      </div>
      
      {showHelp && (
        <Alert className="bg-muted/50">
          <AlertTitle className="text-sm">Format Information</AlertTitle>
          <AlertDescription className="text-xs">
            <p>Your CSV file should include these columns:</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li><strong>Programme Name</strong> - The program or class name</li>
              <li><strong>Robe Email ID</strong> - Email of the teacher in charge of robes</li>
              <li><strong>Folder Email ID</strong> - Email of the teacher in charge of folders</li>
              <li><strong>Accompanying Teacher</strong> - Name of the robe-in-charge teacher</li>
              <li><strong>Folder in Charge</strong> - Name of the folder-in-charge teacher</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FormatHelp;
