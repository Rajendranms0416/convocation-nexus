
import React from 'react';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import NetworkStatus from './NetworkStatus';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const roleDisplayMap = {
    'robe-in-charge': 'Robe In-charge',
    'folder-in-charge': 'Folder In-charge',
    'super-admin': 'Super Admin',
    'presenter': 'Presenter'
  };

  const roleDisplay = user.role in roleDisplayMap 
    ? roleDisplayMap[user.role as keyof typeof roleDisplayMap] 
    : 'User';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-sm border-b border-convocation-100">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-6">
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="font-display text-base sm:text-xl font-semibold truncate">Convocation Nexus</span>
          <div className="ml-1 hidden sm:flex">
            <span className="rounded-full bg-convocation-100 px-2 py-1 text-xs font-medium">
              {roleDisplay}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <NetworkStatus />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 relative transition-normal">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    <span className="inline-flex sm:hidden items-center rounded-full bg-convocation-100 px-2 py-0.5 text-xs font-medium">
                      {roleDisplay}
                    </span>
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="flex items-center cursor-pointer text-convocation-error">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
