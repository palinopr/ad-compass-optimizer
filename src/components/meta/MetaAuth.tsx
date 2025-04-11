
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetaConnectionFlow from './MetaConnectionFlow';
import MetaConnect from './MetaConnect';
import MetaReviewGuide from './MetaReviewGuide';

const MetaAuth: React.FC = () => {
  return (
    <div className="space-y-4">
      <MetaReviewGuide />
      
      <Tabs defaultValue="flow" className="w-full">
        <TabsList>
          <TabsTrigger value="flow">Connection Flow</TabsTrigger>
          <TabsTrigger value="token">API Token</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow">
          <MetaConnectionFlow />
        </TabsContent>
        
        <TabsContent value="token">
          <MetaConnect />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetaAuth;
