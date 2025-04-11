
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetaConnectionFlow from './MetaConnectionFlow';
import MetaConnect from './MetaConnect';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

const MetaAuth: React.FC = () => {
  return (
    <div className="space-y-4">
      <Alert className="bg-green-50 border-green-200 text-green-800">
        <CheckCircle className="h-4 w-4 mr-2" />
        <AlertTitle>Meta App Approved</AlertTitle>
        <AlertDescription>
          Your Meta application has been approved. You now have full access to create and manage campaigns.
        </AlertDescription>
      </Alert>
      
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
