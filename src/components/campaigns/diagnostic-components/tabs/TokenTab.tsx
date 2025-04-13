
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import TokenDetails from '../TokenDetails';

interface TokenTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const TokenTab: React.FC<TokenTabProps> = ({ 
  diagnosticResults,
  runDiagnostic
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Meta Token Analysis</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostic} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Recheck Token
        </Button>
      </div>
      
      {diagnosticResults && diagnosticResults.token ? (
        <TokenDetails 
          tokenInfo={diagnosticResults.token}
          tokenAnalysis={diagnosticResults.tokenAnalysis}
        />
      ) : (
        <div className="text-center py-6 text-gray-500">
          Run diagnostics to analyze token details
        </div>
      )}
    </div>
  );
};

export default TokenTab;
