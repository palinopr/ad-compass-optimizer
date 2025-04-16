
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useProfileData } from './hooks/useProfileData';
import MetaLimitedAccessWarning from '@/components/meta/MetaLimitedAccessWarning';
import { Skeleton } from '@/components/ui/skeleton';

const UserProfile: React.FC = () => {
  const { 
    userData, 
    isLoading, 
    error, 
    hasFallbackData,
    handleDisconnect,
    handleRefreshToken
  } = useProfileData();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-sm text-muted-foreground">
        Not connected to Meta
      </div>
    );
  }

  // Get initials for avatar fallback
  const initials = userData.name
    ? userData.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'MU';

  return (
    <div className="space-y-4">
      {/* Show warning if using fallback data */}
      {hasFallbackData && (
        <MetaLimitedAccessWarning onRefreshToken={handleRefreshToken} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar>
            {userData.picture && <AvatarImage src={userData.picture} alt={userData.name || 'User'} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{userData.name || 'Meta User'}</div>
            {userData.email && <div className="text-sm text-muted-foreground">{userData.email}</div>}
            {hasFallbackData && (
              <div className="flex items-center mt-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Limited profile access</span>
              </div>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDisconnect}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
