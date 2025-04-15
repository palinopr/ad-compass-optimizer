
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { useAdAccountSelection } from '@/hooks/campaigns/useAdAccountSelection';

interface ExternalMetaLinkProps {
  type: 'adsManager' | 'createCampaign' | 'businessManager' | 'adAccount';
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  className?: string;
}

const ExternalMetaLink: React.FC<ExternalMetaLinkProps> = ({ 
  type, 
  variant = 'outline',
  size = 'sm',
  children,
  className = ''
}) => {
  const { selectedAccount } = useAdAccountSelection();
  
  // Extract just the numeric part of the account ID
  const accountId = selectedAccount.hasAccount && selectedAccount.adAccountId
    ? selectedAccount.adAccountId.replace('act_', '') 
    : null;
  
  // Generate the appropriate URL based on type
  const getUrl = () => {
    if (!accountId) return 'https://business.facebook.com/adsmanager';
    
    switch (type) {
      case 'adsManager':
        return `https://business.facebook.com/adsmanager/manage/campaigns?act=${accountId}`;
      case 'createCampaign':
        return `https://business.facebook.com/adsmanager/create?act=${accountId}`;
      case 'businessManager':
        return 'https://business.facebook.com/settings';
      case 'adAccount':
        return `https://business.facebook.com/adsmanager/manage/adaccounts?act=${accountId}`;
      default:
        return `https://business.facebook.com/adsmanager?act=${accountId}`;
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
      asChild
    >
      <a 
        href={getUrl()} 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
};

export default ExternalMetaLink;
