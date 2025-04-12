
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AdAccountsEmptyProps {
  onRefresh: () => void;
}

const AdAccountsEmpty: React.FC<AdAccountsEmptyProps> = ({ onRefresh }) => {
  return (
    <div className="space-y-4">
      <div className="text-slate-500 text-sm">
        No ad accounts found. Please make sure you have access to Meta Ads accounts.
      </div>
      <Button 
        variant="outline" 
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Accounts
      </Button>
    </div>
  );
};

export default AdAccountsEmpty;
