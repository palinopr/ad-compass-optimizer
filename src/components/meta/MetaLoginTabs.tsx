
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacebookLoginTab from './FacebookLoginTab';
import TokenInputTab from './TokenInputTab';

interface MetaLoginTabsProps {
  onLoginSuccess: (userData: any) => void;
  onError: (errorMessage: string) => void;
}

const MetaLoginTabs: React.FC<MetaLoginTabsProps> = ({ onLoginSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState<string>("facebook");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="facebook">Facebook Login</TabsTrigger>
          <TabsTrigger value="token">System User Token</TabsTrigger>
        </TabsList>
        
        <TabsContent value="facebook">
          <FacebookLoginTab onLoginSuccess={onLoginSuccess} />
        </TabsContent>
        
        <TabsContent value="token">
          <TokenInputTab 
            onTokenSuccess={onLoginSuccess} 
            onTokenError={onError}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetaLoginTabs;
