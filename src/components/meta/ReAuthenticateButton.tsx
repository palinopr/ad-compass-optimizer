
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

interface ReAuthenticateButtonProps {
  onReAuthenticated: () => void;
}

const ReAuthenticateButton: React.FC<ReAuthenticateButtonProps> = ({ onReAuthenticated }) => {
  const { toast } = useToast();
  
  const handleReAuthenticate = () => {
    // Clear existing token
    metaAuthService.logout();
    
    // Notify user
    toast({
      title: "Re-authentication Required",
      description: "Please connect your Facebook account again.",
    });
    
    // Trigger re-authentication flow
    onReAuthenticated();
  };
  
  return (
    <Button 
      variant="outline" 
      onClick={handleReAuthenticate}
      className="flex items-center"
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Re-authenticate Connection
    </Button>
  );
};

export default ReAuthenticateButton;
