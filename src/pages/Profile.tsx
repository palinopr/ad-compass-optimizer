
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AccountTab from '@/components/profile/AccountTab';
import MetaConnectionTab from '@/components/profile/MetaConnectionTab';
import PrivacyTab from '@/components/profile/PrivacyTab';
import { useProfileData } from '@/components/profile/hooks/useProfileData';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('account');
  const { userData, isLoading, error, handleDisconnect } = useProfileData();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and Meta connections.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="meta">Meta Connection</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-4 mt-4">
            <AccountTab 
              userData={userData} 
              isLoading={isLoading} 
              error={error} 
            />
          </TabsContent>
          
          <TabsContent value="meta" className="space-y-4 mt-4">
            <MetaConnectionTab 
              userData={userData}
              handleDisconnect={handleDisconnect}
            />
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <PrivacyTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Profile;
