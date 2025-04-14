
import React from 'react';
import DiagnosticResults from './DiagnosticResults';
import CorsAlert from './CorsAlert';
import { metaAuthService } from '@/services/MetaAuthService';
import DiagnosticsHeader from './DiagnosticsHeader';
import LastMetaError from './LastMetaError';
import CurrentMetaTokenInfo from './CurrentMetaTokenInfo';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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

