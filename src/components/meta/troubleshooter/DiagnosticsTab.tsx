
import React from 'react';
import DiagnosticResults from './DiagnosticResults';
import CorsAlert from './CorsAlert';
import { metaAuthService } from '@/services/MetaAuthService';
import DiagnosticsHeader from './DiagnosticsHeader';
import LastMetaError from './LastMetaError';
import CurrentMetaTokenInfo from './CurrentMetaTokenInfo';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown, AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { META_API_CONFIG } from '@/config/socialAuth';

interface DiagnosticsTabProps {
  diagnosticResults: any;
  runningDiagnostic: boolean;
  runDiagnostic: () => void;
  getPermissionStatus: () => 'ok' | 'missing' | 'insufficient' | 'unknown';
  getApiConnectionStatus: () => 'ok' | 'failed' | 'unknown';
}

const DiagnosticsTab: React.FC<DiagnosticsTabProps> = ({
  diagnosticResults,
  runningDiagnostic,
  runDiagnostic,
  getPermissionStatus,
  getApiConnectionStatus
}) => {
  const lastMetaError = React.useMemo(() => {
    try {
      const raw = localStorage.getItem('last_meta_error');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const permissions = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('meta_permissions') || '[]');
    } catch {
      return [];
    }
  }, []);

  // Check for missing required permissions
  const missingPermissions = React.useMemo(() => {
    return META_API_CONFIG.adPermissions.filter(
      perm => !permissions.includes(perm)
    );
  }, [permissions]);

  // Connection status checks
  const token = React.useMemo(() => metaAuthService.getAccessToken(), []);
  const selectedAdAccount = React.useMemo(() => localStorage.getItem('selected_ad_account'), []);

  return (
    <div className="bg-white border rounded-md p-4">
      {/* Connection Status Summary Card */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Meta Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {token ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span>Token: {token ? 'Present' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {missingPermissions.length === 0 ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span>
              Permissions: {missingPermissions.length === 0 ? 
                'Valid' : 
                `Missing: ${missingPermissions.join(', ')}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedAdAccount ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span>
              Ad Account: {selectedAdAccount ? 
                selectedAdAccount : 
                'Not selected'}
            </span>
          </div>
        </CardContent>
      </Card>

      <DiagnosticsHeader 
        runningDiagnostic={runningDiagnostic}
        runDiagnostic={runDiagnostic}
      />
      
      {/* Persistent warning for missing permissions */}
      {missingPermissions.length > 0 && diagnosticResults && (
        <Alert variant="destructive" className="mt-4 mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Missing required permissions: {missingPermissions.join(', ')}. Expand diagnostics below to reconnect.
          </AlertDescription>
        </Alert>
      )}
      
      {diagnosticResults ? (
        <Collapsible className="mt-4">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ChevronDown className="h-4 w-4" />
            🛠️ Advanced Diagnostics
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <DiagnosticResults 
              diagnosticResults={diagnosticResults}
              getPermissionStatus={getPermissionStatus}
              getApiConnectionStatus={getApiConnectionStatus}
            />
            
            <CorsAlert 
              diagnosticResults={diagnosticResults} 
              tokenSource={metaAuthService.getTokenSource()}
            />

            <CurrentMetaTokenInfo />
            <LastMetaError lastMetaError={lastMetaError} />
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="text-center py-6 text-gray-500">
          {runningDiagnostic ? 'Running diagnostics...' : 'Run diagnostics to analyze connection issues'}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsTab;
