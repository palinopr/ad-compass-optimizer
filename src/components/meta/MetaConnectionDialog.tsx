
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FacebookLoginTab from './FacebookLoginTab';

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
