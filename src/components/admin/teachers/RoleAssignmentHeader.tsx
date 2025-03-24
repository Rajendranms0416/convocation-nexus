
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleAssignmentHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const RoleAssignmentHeader: React.FC<RoleAssignmentHeaderProps> = ({ 
  onRefresh, 
  isRefreshing 
}) => {
  const navigate = useNavigate();

  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-2xl">Teacher Role Management</CardTitle>
          <CardDescription>
            Assign roles and classes to teachers for the convocation
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};

export default RoleAssignmentHeader;
