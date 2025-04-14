
import React from 'react';
import { Shield, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DiagnosticResults from './DiagnosticResults';
import CorsAlert from './CorsAlert';
import { metaAuthService } from '@/services/MetaAuthService';

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

  return (
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
          <DiagnosticResults 
            diagnosticResults={diagnosticResults}
            getPermissionStatus={getPermissionStatus}
            getApiConnectionStatus={getApiConnectionStatus}
          />
          
          <CorsAlert 
            diagnosticResults={diagnosticResults} 
            tokenSource={metaAuthService.getTokenSource()}
          />

          {lastMetaError && (
            <Card className="mt-4 border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 flex items-center text-lg">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Last Meta API Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Timestamp: {new Date(lastMetaError.timestamp).toLocaleString()}
                  </div>
                  <div className="bg-white rounded-md p-3 overflow-auto border text-sm">
                    <div className="font-medium mb-2">Error Message:</div>
                    <div className="text-red-600">{lastMetaError.error}</div>
                    
                    <div className="font-medium mt-4 mb-2">Context:</div>
                    <div className="text-gray-600">
                      <div>Should Reconnect: {lastMetaError.context.shouldReconnect ? 'Yes' : 'No'}</div>
                      <div>Token Present: {lastMetaError.context.tokenPresent ? 'Yes' : 'No'}</div>
                      <div>Mock Mode: {lastMetaError.context.mockMode ? 'Yes' : 'No'}</div>
                    </div>
                    
                    {lastMetaError.rawError && (
                      <>
                        <div className="font-medium mt-4 mb-2">Raw Error:</div>
                        <pre className="text-xs whitespace-pre-wrap break-words text-gray-600">
                          {JSON.stringify(lastMetaError.rawError, null, 2)}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          {runningDiagnostic ? 'Running diagnostics...' : 'Run diagnostics to analyze connection issues'}
        </div>
      )}
    </div>
  );
};

export default DiagnosticsTab;
