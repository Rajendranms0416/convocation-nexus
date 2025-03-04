
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { LogOut, User } from 'lucide-react';
import TimeSettings from '@/components/settings/TimeSettings';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white border-b border-convocation-100 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-convocation-700">Convocation Nexus</h1>
          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-convocation-100 text-convocation-600">
            {user.role.replace(/-/g, ' ')}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {user.role === 'super-admin' && (
            <TimeSettings className="mr-2" />
          )}
          
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="w-8 h-8 rounded-full bg-convocation-200 flex items-center justify-center mr-2">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-convocation-600" />
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-convocation-400">{user.email}</div>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-convocation-error"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
