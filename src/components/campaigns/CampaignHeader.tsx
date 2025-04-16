
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface CampaignHeaderProps {
  onCreateCampaign: () => void;
  disabled: boolean;
  isAuthenticated?: boolean;
  hasAdAccount?: boolean;
  hasPermissions?: boolean;
  showConnectionDialog?: boolean;
  setShowConnectionDialog?: React.Dispatch<React.SetStateAction<boolean>>;
  refreshConnection?: () => void;
  isAuthSyncing?: boolean;
}

const CampaignHeader: React.FC<CampaignHeaderProps> = ({ 
  onCreateCampaign, 
  disabled,
  isAuthenticated,
  hasAdAccount,
  hasPermissions, 
  showConnectionDialog,
  setShowConnectionDialog,
  refreshConnection,
  isAuthSyncing
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
        <p className="text-muted-foreground">Create and manage your Meta advertising campaigns for events.</p>
      </div>
      <Button 
        onClick={onCreateCampaign}
        className="bg-meta-blue hover:bg-meta-dark"
        disabled={disabled}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Campaign
      </Button>
    </div>
  );
};

export default CampaignHeader;
