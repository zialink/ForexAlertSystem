import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Settings, User, LogOut } from 'lucide-react';

interface UserProfileProps {
  onSettingsClick: () => void;
}

export default function UserProfile({ onSettingsClick }: UserProfileProps) {
  const { currentUser, logOut } = useAuth();

  if (!currentUser) {
    return null;
  }

  // Get user initials for avatar fallback
  const userInitials = currentUser.displayName 
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="p-0 h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {currentUser.photoURL ? (
              <AvatarImage src={currentUser.photoURL} alt={currentUser.displayName || 'User'} />
            ) : null}
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="end">
        <div className="flex flex-col space-y-1 mb-3">
          <p className="text-sm font-medium leading-none">{currentUser.displayName || 'User'}</p>
          <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
        </div>
        <div className="flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start" 
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start text-red-500 hover:text-red-600" 
            onClick={() => logOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}