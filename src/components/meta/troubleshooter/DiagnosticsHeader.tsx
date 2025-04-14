
import React from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiagnosticsHeaderProps {
  runningDiagnostic: boolean;
  runDiagnostic: () => void;
}

const DiagnosticsHeader: React.FC<DiagnosticsHeaderProps> = ({
  runningDiagnostic,
  runDiagnostic
}) => {
  return (
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
  );
};

export default DiagnosticsHeader;
