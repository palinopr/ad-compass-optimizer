
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck';
import { useTroubleshooter } from './troubleshooter/hooks/useTroubleshooter';

// Import sub-components
import AdAccountTab from './troubleshooter/AdAccountTab';
import DiagnosticsTab from './troubleshooter/DiagnosticsTab';
import PermissionError from './troubleshooter/PermissionError';
import ActionButtons from './troubleshooter/ActionButtons';

interface CampaignLoadingTroubleshooterProps {
  errorDetails?: any;
  onRetry: () => void;
}

const CampaignLoadingTroubleshooter: React.FC<CampaignLoadingTroubleshooterProps> = ({
  errorDetails,
  onRetry
}) => {
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  
  // ALWAYS use direct token check as the source of truth
  const token = localStorage.getItem('meta_access_token');
  const effectiveIsAuthenticated = token && token.length >= 50;
  
  // Run the full authentication check to get permissions information
  const authResult = validateAuthentication();
  
  const {
    activeTab,
    setActiveTab,
    runningDiagnostic,
    diagnosticResults,
    isPermissionError,
    isAccountError,
    handleRefreshSession,
    runDiagnostic,
    getPermissionStatus,
    getApiConnectionStatus
  } = useTroubleshooter(errorDetails, onRetry);
  
  // Log detailed authentication information
  React.useEffect(() => {
    console.log('CampaignLoadingTroubleshooter - Authentication status:');
    console.log('  Direct token check:', effectiveIsAuthenticated ? 'Valid token' : 'No valid token');
    console.log('  Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
    console.log('  Auth validation result:', authResult.isValid ? 'Valid' : 'Invalid');
    
    if (errorDetails) {
      console.log('Error details in troubleshooter:', errorDetails);
    }
    
    // Ensure authentication is fresh if there's a mismatch
    if (effectiveIsAuthenticated && !isAuthenticated) {
      console.log('Auth state mismatch in troubleshooter, refreshing context...');
      checkAuth();
    }
  }, [effectiveIsAuthenticated, isAuthenticated, checkAuth, errorDetails, authResult]);

  // Use the more reliable authentication status
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
            {effectiveIsAuthenticated ? 
              "You're successfully logged in with Facebook, but we're still having trouble loading your campaigns." :
              "We're having trouble with your Meta connection or permissions."}
            This typically happens due to one of these reasons:
          </p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>No ad account is selected or the selection is incorrect</li>
            <li>Your Facebook account lacks necessary permissions for the selected ad account</li>
            <li>Your Facebook session needs to be refreshed</li>
          </ul>
        </div>
        
        <PermissionError isPermissionError={isPermissionError} />
        
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
            <AdAccountTab />
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-4">
            <DiagnosticsTab 
              diagnosticResults={diagnosticResults}
              runningDiagnostic={runningDiagnostic}
              runDiagnostic={runDiagnostic}
              getPermissionStatus={getPermissionStatus}
              getApiConnectionStatus={getApiConnectionStatus}
            />
          </TabsContent>
        </Tabs>
        
        <ActionButtons 
          onRetry={onRetry} 
          handleRefreshSession={handleRefreshSession} 
        />
      </CardContent>
    </Card>
  );
};

export default CampaignLoadingTroubleshooter;
