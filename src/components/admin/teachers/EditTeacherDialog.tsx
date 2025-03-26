
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/types';

interface EditTeacherDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any | null;
  availableClasses: string[];
  selectedClasses: string[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<string[]>>;
  teacherName: string;
  setTeacherName: React.Dispatch<React.SetStateAction<string>>;
  teacherEmail: string;
  setTeacherEmail: React.Dispatch<React.SetStateAction<string>>;
  emailType: 'robe' | 'folder' | 'presenter'; // Updated to include 'presenter'
  setEmailType: React.Dispatch<React.SetStateAction<'robe' | 'folder' | 'presenter'>>; // Updated to include 'presenter'
  onUpdate: () => void;
  setTeacherRole: React.Dispatch<React.SetStateAction<Role>>;
}

const EditTeacherDialog: React.FC<EditTeacherDialogProps> = ({
  isOpen,
  onClose,
  teacher,
  availableClasses,
  selectedClasses,
  setSelectedClasses,
  teacherName,
  setTeacherName,
  teacherEmail,
  setTeacherEmail,
  emailType,
  setEmailType,
  onUpdate,
  setTeacherRole
}) => {
  const toggleClassSelection = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Teacher</DialogTitle>
          <DialogDescription>
            Update the teacher's information
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editTeacherName">Name</Label>
            <Input 
              id="editTeacherName" 
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="editTeacherEmail">Email</Label>
            <Input 
              id="editTeacherEmail" 
              type="email"
              value={teacherEmail}
              onChange={(e) => setTeacherEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailType">Email Type</Label>
            <Select 
              value={emailType} 
              onValueChange={(value) => {
                setEmailType(value as 'robe' | 'folder' | 'presenter');
                setTeacherRole(
                  value === 'robe' ? 'robe-in-charge' : 
                  value === 'folder' ? 'folder-in-charge' : 'presenter'
                );
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="robe">Robe Email (Robe In-charge)</SelectItem>
                <SelectItem value="folder">Folder Email (Folder In-charge)</SelectItem>
                <SelectItem value="presenter">Presenter Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Assigned Classes</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onUpdate}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTeacherDialog;
