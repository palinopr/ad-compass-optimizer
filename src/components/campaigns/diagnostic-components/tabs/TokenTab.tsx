
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
        <h3 className="text-lg font-medium">Token Details</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostic} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh Info
        </Button>
      </div>
      
      {diagnosticResults?.tokenAnalysis && (
        <TokenDetails 
          tokenInfo={diagnosticResults.token || {}}
          tokenAnalysis={diagnosticResults.tokenAnalysis}
        />
      )}
    </div>
  );
};

export default TokenTab;
