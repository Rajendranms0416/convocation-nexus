
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User, Smartphone, Laptop } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TimeDisplay from '@/components/settings/TimeDisplay';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSwitchToMobile = () => {
    localStorage.setItem('devicePreference', 'mobile');
    window.location.href = '/mobile-dashboard';
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container px-4 py-3 mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/convocation-logo.svg" 
              alt="Convocation Logo" 
              className="h-8 w-auto" 
            />
            <div>
              <h1 className="text-xl font-bold">Convocation Nexus</h1>
              <div className="flex justify-center">
                <TimeDisplay className="text-xs" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {user?.role === 'super-admin' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex"
                      onClick={() => navigate('/device-logs')}
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      Device Logs
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View device usage logs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwitchToMobile}
                    className="hidden md:flex"
                  >
                    <Smartphone className="h-4 w-4 mr-2" />
                    Mobile View
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Switch to mobile interface</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-convocation-100 text-convocation-700">
                      {user?.name.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                      {user?.role.replace(/-/g, ' ')}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user?.role === 'super-admin' && (
                  <DropdownMenuItem onClick={() => navigate('/device-logs')} className="md:hidden">
                    <Smartphone className="mr-2 h-4 w-4" />
                    <span>Device Logs</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSwitchToMobile} className="md:hidden">
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Switch to Mobile View</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
