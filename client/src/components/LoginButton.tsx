import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, LogOut } from 'lucide-react';

interface LoginButtonProps {
  className?: string;
}

export default function LoginButton({ className = '' }: LoginButtonProps) {
  const { currentUser, signIn, logOut } = useAuth();

  const handleAuth = async () => {
    if (currentUser) {
      await logOut();
    } else {
      await signIn();
    }
  };

  return (
    <Button 
      onClick={handleAuth} 
      className={`flex items-center ${className}`}
      variant={currentUser ? "outline" : "default"}
    >
      {currentUser ? (
        <>
          <LogOut className="h-4 w-4 mr-2" />
          <span>Sign Out</span>
        </>
      ) : (
        <>
          <LogIn className="h-4 w-4 mr-2" />
          <span>Sign in with Google</span>
        </>
      )}
    </Button>
  );
}