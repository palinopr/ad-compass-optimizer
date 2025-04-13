
import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Database, RefreshCw, Server, Shield } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';

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

  const hasDatabaseConnections = false; // This would need to be checked against actual database connection logic
  
  const getSystemStatus = () => {
    if (!diagnosticResults) return 'unknown';
    
    // Create a combined status based on diagnostic results
    const authOk = diagnosticResults.token.hasToken;
    const permissionsOk = diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement;
    const apiOk = diagnosticResults.api.success;
    
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
        {/* System Status */}
        <div className="mb-4">
          <Alert 
            className={
              systemStatus === 'healthy' ? "border-green-200 bg-green-50" : 
              systemStatus === 'no-database' ? "border-amber-200 bg-amber-50" :
              "border-red-200 bg-red-50"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>System Status: {systemStatus === 'healthy' ? 'Healthy' : 'Issues Detected'}</AlertTitle>
            <AlertDescription>
              {systemStatus === 'healthy' && "All systems operational. Your campaign system is working correctly."}
              {systemStatus === 'not-authenticated' && "You're not authenticated with Meta. Please connect your account."}
              {systemStatus === 'permission-issue' && "Your Meta account is missing required permissions."}
              {systemStatus === 'api-error' && "Unable to connect to Meta API. Check your connection settings."}
              {systemStatus === 'no-database' && (
                <div className="space-y-2">
                  <p>No database connection detected. Some campaign features may be limited.</p>
                  <div className="flex items-center mt-2">
                    <Database className="h-4 w-4 mr-2" />
                    <span>To enable full functionality, connect to Supabase using the integration button in the top toolbar.</span>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
        
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Meta API Connection</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runDiagnostic} 
                  disabled={runningDiagnostic}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`h-3 w-3 ${runningDiagnostic ? 'animate-spin' : ''}`} />
                  {runningDiagnostic ? 'Running...' : 'Run Diagnostic'}
                </Button>
              </div>
              
              {diagnosticResults ? (
                <div className="space-y-4">
                  {/* Auth Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className={`border rounded p-3 ${diagnosticResults.token.hasToken ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs font-medium">Authentication</p>
                      <p className="text-sm mt-1">
                        {diagnosticResults.token.hasToken 
                          ? `Using ${metaAuthService.getTokenSource() || 'unknown'} auth`
                          : "Not authenticated"}
                      </p>
                    </div>
                    
                    <div className={`border rounded p-3 ${(diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement) ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <p className="text-xs font-medium">Permissions</p>
                      <p className="text-sm mt-1">
                        {(diagnosticResults.token.hasAdsRead || diagnosticResults.token.hasAdsManagement) 
                          ? "Required permissions present" 
                          : "Missing required permissions"}
                      </p>
                    </div>
                    
                    <div className={`border rounded p-3 ${diagnosticResults.api.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <p className="text-xs font-medium">API Connection</p>
                      <p className="text-sm mt-1">
                        {diagnosticResults.api.success 
                          ? "API connection successful" 
                          : "API connection failed"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Issues & Recommendations */}
                  {diagnosticResults.summary && diagnosticResults.summary.issues && 
                   diagnosticResults.summary.issues.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Issues Detected</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {diagnosticResults.summary.issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {runningDiagnostic ? 'Running diagnostics...' : 'Run diagnostics to analyze connection issues'}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="database">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Database Connection</h3>
              
              <Alert className="bg-blue-50 border-blue-200">
                <Database className="h-4 w-4" />
                <AlertTitle>Database Integration</AlertTitle>
                <AlertDescription>
                  <p>This application currently doesn't have a database connection.</p>
                  <p className="mt-2">To enable advanced campaign storage and management features:</p>
                  <ul className="list-disc pl-5 text-sm mt-1">
                    <li>Click the Supabase button in the top toolbar</li>
                    <li>Connect to a Supabase project</li>
                    <li>Create campaign tables for data persistence</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Performance Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="border rounded p-3">
                  <p className="text-xs font-medium">API Response Time</p>
                  <p className="text-sm mt-1">Not measured</p>
                </div>
                
                <div className="border rounded p-3">
                  <p className="text-xs font-medium">Page Load Performance</p>
                  <p className="text-sm mt-1">Not measured</p>
                </div>
              </div>
              
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Performance Analysis</AlertTitle>
                <AlertDescription>
                  Enable database integration to track and analyze campaign performance metrics.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CampaignDiagnostics;
