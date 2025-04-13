
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionTab } from './ConnectionTab';
import { DatabaseTab } from './DatabaseTab';
import { PerformanceTab } from './PerformanceTab';

interface DiagnosticTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  diagnosticResults: any;
  runningDiagnostic: boolean;
  runDiagnostic: () => void;
}

export const DiagnosticTabs: React.FC<DiagnosticTabsProps> = ({
  activeTab,
  setActiveTab,
  diagnosticResults,
  runningDiagnostic,
  runDiagnostic
}) => {
  return (
    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4">
        <TabsTrigger value="connection">Connection</TabsTrigger>
        <TabsTrigger value="database">Database</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>
      
      <TabsContent value="connection">
        <ConnectionTab 
          diagnosticResults={diagnosticResults}
          runningDiagnostic={runningDiagnostic}
          runDiagnostic={runDiagnostic}
        />
      </TabsContent>
      
      <TabsContent value="database">
        <DatabaseTab />
      </TabsContent>
      
      <TabsContent value="performance">
        <PerformanceTab />
      </TabsContent>
    </Tabs>
  );
};
