
import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
