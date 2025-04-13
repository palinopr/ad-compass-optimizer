
import React, { useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FacebookLoginTab from './FacebookLoginTab';
import { metaAuthService } from '@/services/MetaAuthService';

interface MetaConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaConnectionDialog: React.FC<MetaConnectionDialogProps> = ({ 
  open,
  onOpenChange,
  onSuccess,
  onError
}) => {
  // Check if already authenticated when dialog is opened
  useEffect(() => {
    if (open && metaAuthService.isAuthenticated()) {
      console.log('User is already authenticated, closing dialog');
      // Get user data if available
      const userId = metaAuthService.getUserId();
      const userName = localStorage.getItem('meta_user_name') || 'Meta User';
      
      // Close dialog and signal success with existing user data
      onOpenChange(false);
      onSuccess({ id: userId, name: userName });
    }
  }, [open, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Meta Ads Account</DialogTitle>
          <DialogDescription>
            Connect your Meta account to access your ad data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <FacebookLoginTab onLoginSuccess={onSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetaConnectionDialog;
