
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenInputTab from './TokenInputTab';
import FacebookLoginTab from './FacebookLoginTab';

interface MetaConnectionDialogProps {
  open: boolean; // Changed from isOpen to open to match usage in Campaigns.tsx
  onOpenChange: (open: boolean) => void;
  onSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaConnectionDialog: React.FC<MetaConnectionDialogProps> = ({ 
  open, // Changed from isOpen to open
  onOpenChange,
  onSuccess,
  onError
}) => {
  const [activeTab, setActiveTab] = useState<string>("token");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Meta Ads Account</DialogTitle>
          <DialogDescription>
            Connect your Meta account to access your ad data
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="facebook">Facebook Login</TabsTrigger>
            <TabsTrigger value="token">Access Token</TabsTrigger>
          </TabsList>
          
          <TabsContent value="facebook" className="space-y-4">
            <FacebookLoginTab onLoginSuccess={onSuccess} />
          </TabsContent>
          
          <TabsContent value="token" className="space-y-4">
            <TokenInputTab 
              onTokenSuccess={onSuccess} 
              onTokenError={onError}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MetaConnectionDialog;
