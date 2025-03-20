
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ClassAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any | null;
  availableClasses: string[];
  selectedClasses: string[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  onSave: (teacher: any, selectedClasses: string[]) => void;
}

const ClassAssignmentDialog: React.FC<ClassAssignmentDialogProps> = ({
  isOpen,
  onClose,
  teacher,
  availableClasses,
  selectedClasses,
  setSelectedClasses,
  onSave
}) => {
  const toggleClassSelection = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleSave = () => {
    onSave(teacher, selectedClasses);
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Classes</DialogTitle>
          <DialogDescription>
            Select classes for {teacher.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {availableClasses.map((cls) => (
              <div 
                key={cls}
                className={`flex items-center justify-between p-2 rounded-md border cursor-pointer ${
                  selectedClasses.includes(cls) ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-secondary/10'
                }`}
                onClick={() => toggleClassSelection(cls)}
              >
                <span>{cls}</span>
                {selectedClasses.includes(cls) && (
                  <CheckIcon className="h-4 w-4 text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedClasses.length} classes selected
            </span>
            <div>
              <Button variant="outline" onClick={onClose} className="mr-2">
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassAssignmentDialog;
