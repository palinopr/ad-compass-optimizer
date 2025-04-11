
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenInputTab from './TokenInputTab';

interface MetaConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaConnectionDialog: React.FC<MetaConnectionDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onSuccess,
  onError
}) => {
  const [activeTab, setActiveTab] = useState<string>("token");
  
  const handleTokenSuccess = (userData: any) => {
    onSuccess(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Meta Ads Account</DialogTitle>
          <DialogDescription>
            Connect your Meta account to access your ad data
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 w-full mb-4">
            <TabsTrigger value="token">Access Token</TabsTrigger>
          </TabsList>
          
          <TabsContent value="token" className="space-y-4">
            <TokenInputTab 
              onTokenSuccess={handleTokenSuccess} 
              onTokenError={onError}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MetaConnectionDialog;
