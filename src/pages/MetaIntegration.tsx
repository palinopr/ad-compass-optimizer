
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMetaIntegration } from '@/components/meta/integration/useMetaIntegration';
import MetaConnectionStatus from '@/components/meta/MetaConnectionStatus';

// Import tab components
import AccountsTab from '@/components/meta/integration/tabs/AccountsTab';
import FlowTab from '@/components/meta/integration/tabs/FlowTab';
import SettingsTab from '@/components/meta/integration/tabs/SettingsTab';
import DiagnosticsTab from '@/components/meta/integration/tabs/DiagnosticsTab';

// Import other components
import IntegrationHeader from '@/components/meta/integration/IntegrationHeader';
import AdAccountSection from '@/components/meta/integration/AdAccountSection';

export default function MetaIntegration() {
  const {
    activeTab,
    isAuthenticated,
    isRefreshing,
    handleDisconnect,
    handleRefresh,
    handleTabChange
  } = useMetaIntegration();

  return (
    <AppLayout>
      <div className="space-y-6">
        <IntegrationHeader
          isAuthenticated={isAuthenticated}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onDisconnect={handleDisconnect}
        />

        <div className="mb-4">
          <MetaConnectionStatus />
        </div>

        <AdAccountSection isAuthenticated={isAuthenticated} />

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">Account Connection</TabsTrigger>
            <TabsTrigger value="flow">Integration Flow</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="accounts" className="space-y-4 mt-4">
            <AccountsTab isAuthenticated={isAuthenticated} />
          </TabsContent>
          
          <TabsContent value="flow" className="space-y-4 mt-4">
            <FlowTab />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <SettingsTab isAuthenticated={isAuthenticated} />
          </TabsContent>
          
          <TabsContent value="diagnostics" className="space-y-4 mt-4">
            <DiagnosticsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
