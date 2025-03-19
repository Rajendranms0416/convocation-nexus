
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckIcon, UserPlusIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@/types';

interface AddTeacherDialogProps {
  availableClasses: string[];
  onAddTeacher: (
    name: string, 
    email: string, 
    role: Role, 
    emailType: 'robe' | 'folder', 
    selectedClasses: string[]
  ) => void;
}

const AddTeacherDialog: React.FC<AddTeacherDialogProps> = ({ 
  availableClasses, 
  onAddTeacher 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherRole, setNewTeacherRole] = useState<Role>('presenter');
  const [emailType, setEmailType] = useState<'robe' | 'folder'>('robe');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const toggleClassSelection = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter(c => c !== className));
    } else {
      setSelectedClasses([...selectedClasses, className]);
    }
  };

  const handleAdd = () => {
    onAddTeacher(
      newTeacherName,
      newTeacherEmail,
      newTeacherRole,
      emailType,
      selectedClasses
    );
    
    // Reset form
    setNewTeacherName('');
    setNewTeacherEmail('');
    setNewTeacherRole('presenter');
    setEmailType('robe');
    setSelectedClasses([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
          <DialogDescription>
            Enter the details for the new teacher
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="teacherName">Name</Label>
            <Input 
              id="teacherName" 
              value={newTeacherName}
              onChange={(e) => setNewTeacherName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="teacherEmail">Email</Label>
            <Input 
              id="teacherEmail" 
              type="email"
              value={newTeacherEmail}
              onChange={(e) => setNewTeacherEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="emailType">Email Type</Label>
            <Select 
              value={emailType} 
              onValueChange={(value) => {
                setEmailType(value as 'robe' | 'folder');
                setNewTeacherRole(value === 'robe' ? 'robe-in-charge' : 'folder-in-charge');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select email type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="robe">Robe Email (Robe In-charge)</SelectItem>
                <SelectItem value="folder">Folder Email (Folder In-charge)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Assigned Class</Label>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            Add Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTeacherDialog;
