
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Briefcase, Shield, Database, CheckCircle, ShieldAlert } from 'lucide-react';
import AdAccountSelector from './ad-accounts/AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CampaignLoadingTroubleshooterProps {
  errorDetails?: any;
  onRetry: () => void;
}

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

const CampaignLoadingTroubleshooter: React.FC<CampaignLoadingTroubleshooterProps> = ({
  errorDetails,
  onRetry
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult | null>(null);
  const tokenSource = metaAuthService.getTokenSource();
  
  // Check for specific error types
  const isPermissionError = errorDetails?.error?.message?.toLowerCase().includes('permission') || 
                            errorDetails?.error?.code === 200 ||
                            errorDetails?.error?.code === 10;
  
  const isAccountError = errorDetails?.error?.message?.toLowerCase().includes('account') ||
                         !localStorage.getItem('selected_ad_account');
  
  // Run diagnostic on mount to provide immediate feedback
  useEffect(() => {
    runDiagnostic();
    
    // Always default to account tab when the component mounts
    if (isAccountError) {
      setActiveTab('account');
    }
  }, []);
  
  const handleRefreshSession = () => {
    metaAuthService.logout();
    localStorage.setItem('show_meta_connection', 'true');
    toast({
      title: "Session Reset",
      description: "Your Facebook session will be refreshed. Please log in again."
    });
    setTimeout(() => window.location.reload(), 1000);
  };
  
  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      setDiagnosticResults(results);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast({
        title: "Diagnostic Error",
        description: "Failed to run connection diagnostics",
        variant: "destructive"
      });
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  const getPermissionStatus = () => {
    if (!diagnosticResults) return 'unknown';
    
    const token = diagnosticResults.token;
    if (!token.hasToken) return 'missing';
    if (!token.hasAdsRead && !token.hasAdsManagement) return 'insufficient';
    return 'ok';
  };
  
  const getApiConnectionStatus = () => {
    if (!diagnosticResults) return 'unknown';
    return diagnosticResults.api.success ? 'ok' : 'failed';
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 flex items-center text-lg">
          <AlertCircle className="mr-2 h-5 w-5" />
          Campaign Loading Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-800">
          <p className="mb-2">
            You're successfully logged in with Facebook, but we're still having trouble loading your campaigns.
            This typically happens due to one of these reasons:
          </p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>No ad account is selected or the selection is incorrect</li>
            <li>Your Facebook account lacks necessary permissions for the selected ad account</li>
            <li>Your Facebook session needs to be refreshed</li>
          </ul>
        </div>
        
        {isPermissionError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700 font-medium">Permission Error Detected</p>
            <p className="text-sm text-red-600 mt-1">
              Your account doesn't have permission to access this ad account's data. 
              Try selecting a different ad account or log in with a Facebook account that has admin access to your ads.
            </p>
          </div>
        )}
        
        <Tabs defaultValue={isAccountError ? "account" : activeTab} value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border">
            <TabsTrigger value="account" className="data-[state=active]:bg-blue-50">
              Ad Account
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-blue-50">
              Diagnostics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="mt-4">
            <div className="bg-white border rounded-md p-4">
              <h3 className="font-medium flex items-center mb-2">
                <Briefcase className="h-4 w-4 mr-2" />
                Ad Account Selection
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Make sure you've selected the correct ad account that contains your campaigns.
              </p>
              
              <AdAccountSelector />
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-4">
            <div className="bg-white border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Connection Diagnostics
                </h3>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Auth Status */}
                    <div className={`border rounded p-3 ${tokenSource === 'facebook' ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Authentication</p>
                        {tokenSource === 'facebook' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>
                      <p className="text-sm mt-1 capitalize">Using {tokenSource} auth</p>
                    </div>
                    
                    {/* Permissions Status */}
                    <div className={`border rounded p-3 ${getPermissionStatus() === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Permissions</p>
                        {getPermissionStatus() === 'ok' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <ShieldAlert className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm mt-1">
                        {getPermissionStatus() === 'ok' ? 'Required permissions present' : 'Missing required permissions'}
                      </p>
                    </div>
                    
                    {/* API Connection */}
                    <div className={`border rounded p-3 ${getApiConnectionStatus() === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">API Connection</p>
                        {getApiConnectionStatus() === 'ok' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm mt-1">
                        {getApiConnectionStatus() === 'ok' ? 'API connection successful' : 'API connection failed'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Summary of issues */}
                  {diagnosticResults.summary && diagnosticResults.summary.issues && diagnosticResults.summary.issues.length > 0 && (
                    <Alert className={diagnosticResults.summary.overallStatus === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}>
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <p className="font-medium">Issues Detected:</p>
                        <ul className="list-disc pl-5 text-sm mt-1">
                          {diagnosticResults.summary.issues.map((issue: string, i: number) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Recommendations */}
                  {diagnosticResults.summary && diagnosticResults.summary.recommendations && diagnosticResults.summary.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800">
                      <p className="font-medium mb-1">Recommended Actions:</p>
                      <ul className="list-decimal pl-5 text-sm">
                        {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* CORS Specific Alert */}
                  {diagnosticResults.cors && diagnosticResults.cors.hasCorsIssues && tokenSource === 'facebook' && (
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm">
                      <div className="flex">
                        <Database className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <p>
                          CORS issues were detected in diagnostics, but you're using Facebook authentication 
                          which should bypass these issues. Your campaign loading problem is likely related 
                          to ad account selection or permissions rather than CORS.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {runningDiagnostic ? 'Running diagnostics...' : 'Run diagnostics to analyze connection issues'}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading Campaigns
          </Button>
          
          <Button 
            variant="default"
            onClick={handleRefreshSession}
            className="bg-meta-blue hover:bg-meta-dark"
          >
            Refresh Facebook Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignLoadingTroubleshooter;
