
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
            <p>You can upload any CSV or Excel file with data in table format.</p>
            <p className="mt-1">Common columns that might be useful include:</p>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li>Program or class names</li>
              <li>Teacher emails</li>
              <li>Teacher names</li>
              <li>Class sections</li>
            </ul>
            <p className="mt-1">All columns will be preserved and displayed in the preview.</p>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FormatHelp;
