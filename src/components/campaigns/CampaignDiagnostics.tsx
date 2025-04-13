
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server } from 'lucide-react';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { SystemStatusAlert } from './diagnostic-components/SystemStatusAlert';
import { DiagnosticTabs } from './diagnostic-components/DiagnosticTabs';

interface DiagnosticResult {
  timestamp: string;
  token: any;
  tokenAnalysis: any;
  api: any;
  cors: any;
  compatibility: any;
  proxy: any;
  summary: any;
}

const CampaignDiagnostics: React.FC = () => {
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState('connection');

  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      setDiagnosticResults(results);
    } catch (error) {
      console.error("Error running diagnostics:", error);
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  // Run diagnostics on component mount
  useEffect(() => {
    runDiagnostic();
  }, []);

  const getSystemStatus = () => {
    if (!diagnosticResults) return 'unknown';
    
    // Create a combined status based on diagnostic results
    const authOk = diagnosticResults.token.hasToken;
    const permissionsOk = diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement;
    const apiOk = diagnosticResults.api.success;
    const hasDatabaseConnections = false; // This would need to be checked against actual database connection logic
    
    if (!authOk) return 'not-authenticated';
    if (!permissionsOk) return 'permission-issue';
    if (!apiOk) return 'api-error';
    if (!hasDatabaseConnections) return 'no-database';
    
    return 'healthy';
  };
  
  const systemStatus = getSystemStatus();

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Server className="mr-2 h-5 w-5" />
          Lovable Campaign Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SystemStatusAlert systemStatus={systemStatus} />
        
        <DiagnosticTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          diagnosticResults={diagnosticResults}
          runningDiagnostic={runningDiagnostic}
          runDiagnostic={runDiagnostic}
        />
      </CardContent>
    </Card>
  );
};

export default CampaignDiagnostics;
