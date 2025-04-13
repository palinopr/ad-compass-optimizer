
import React, { useEffect, useState } from 'react';
import MetaConnectCard from '@/components/meta/MetaConnectCard';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface AccountsTabProps {
  isAuthenticated: boolean;
}

const AccountsTab: React.FC<AccountsTabProps> = ({ isAuthenticated }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [effectiveIsAuthenticated, setEffectiveIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Always use direct token check as the most reliable method
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    console.log('AccountsTab - Direct auth check:', 
      directAuthCheck ? 'Authenticated' : 'Not authenticated',
      'Prop value:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    
    setEffectiveIsAuthenticated(directAuthCheck);
    setIsLoading(false);
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetaConnectCard />
      {effectiveIsAuthenticated && <AdAccountSelector />}
    </div>
  );
};

export default AccountsTab;
