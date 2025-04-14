import React from 'react';
import { Button } from '@/components/ui/button';
import { Bug, Code, AlertTriangle, Stethoscope, Globe, Shield } from 'lucide-react';
import { ComprehensiveDiagnosticResult } from '@/utils/meta-diagnostics/types';

interface DiagnosticToolsProps {
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean) => void;
  diagnosticResults: ComprehensiveDiagnosticResult | null;
  isRunningTest: boolean;
  isRunningComprehensiveDiagnostic: boolean;
  handleRunDiagnostic: () => void;
  handleApiTest: () => Promise<void>;
  handleCorsCheck: () => Promise<void>;
  handleComprehensiveDiagnostic: () => Promise<void>;
  handleBrowserCompatibility: () => void;
  handleTestProxy: () => Promise<void>;
}

const DiagnosticTools: React.FC<DiagnosticToolsProps> = ({
  showDiagnostics,
  setShowDiagnostics,
  diagnosticResults,
  isRunningTest,
  isRunningComprehensiveDiagnostic,
  handleRunDiagnostic,
  handleApiTest,
  handleCorsCheck,
  handleComprehensiveDiagnostic,
  handleBrowserCompatibility,
  handleTestProxy
}) => {
  const disabled = isRunningTest || isRunningComprehensiveDiagnostic;

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center">
          <Bug className="h-4 w-4 mr-1" /> 
          Diagnostic Tools
        </h4>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          {showDiagnostics ? "Hide" : "Show"} Tools
        </Button>
      </div>

      {showDiagnostics && (
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRunDiagnostic}
            disabled={disabled}
          >
            <Code className="h-3 w-3 mr-1" />
            Token Diagnostic
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleApiTest}
            disabled={disabled}
          >
            <AlertTriangle className="h-3 w-3 mr-1" />
            API Test
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCorsCheck}
            disabled={disabled}
          >
            <Bug className="h-3 w-3 mr-1" />
            CORS Check
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBrowserCompatibility}
            disabled={disabled}
          >
            <Globe className="h-3 w-3 mr-1" />
            Browser Check
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleComprehensiveDiagnostic}
            disabled={disabled}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Stethoscope className="h-3 w-3 mr-1" />
            Lovable Diagnostic
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiagnosticTools;
