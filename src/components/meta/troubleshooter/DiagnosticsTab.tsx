import React from 'react';
import DiagnosticResults from './DiagnosticResults';
import CorsAlert from './CorsAlert';
import { metaAuthService } from '@/services/MetaAuthService';
import DiagnosticsHeader from './DiagnosticsHeader';
import LastMetaError from './LastMetaError';
import CurrentMetaTokenInfo from './CurrentMetaTokenInfo';

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
      <DiagnosticsHeader 
        runningDiagnostic={runningDiagnostic}
        runDiagnostic={runDiagnostic}
      />
      
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

          <CurrentMetaTokenInfo />
          <LastMetaError lastMetaError={lastMetaError} />
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
